import { exec } from "child_process";
import { getStringFromServer, PORT } from "./local-server";
import crypto from 'crypto';

const INTEGRATION_CLIENT_ID = 'db01e9b87906c711f3887d195c26bf38d218c69ce305b7f5a352daa0beb1dccf';

export async function fetchAuthCode(accountId: string = 'system'): Promise<AuthParams> {
    const baseUrl = new URL(`https://${accountId}.netsuite.com/app/login/oauth2/authorize.nl`);
    const verifier = crypto.randomUUID() + crypto.randomUUID();
    const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
    const params = new URLSearchParams({
        'response_type': 'code',
        'client_id': INTEGRATION_CLIENT_ID,
        'redirect_uri': `http://localhost:${PORT}`,
        'scope': 'suite_analytics',
        'state': crypto.randomUUID(),
        'code_challenge': challenge,
        'code_challenge_method': 'S256',
    });
    baseUrl.search = params.toString();
    openUrl(baseUrl);
    const rawResponse = await getStringFromServer();
    const search = parseSearchFromResponse(rawResponse);
    if (!search) {
        throw new Error('Failed to get response from NetSuite');
    }
    if (search.get('error')) {
        throw new Error('Login error: ' + search.get('error'));
    }
    return {
        state: search.get('state') ?? '',
        role: search.get('role') ?? '',
        entity: search.get('entity') ?? '',
        realm: search.get('company') ?? '',
        accountId: search.get('company')?.toLowerCase().replace('_', '-') ?? '',
        grant: search.get('code') ?? '',
        grantType: 'code',
        verifier,
    };
}

export async function fetchAccessToken(authParams: AuthParams): Promise<AuthTokens> {
    const baseUrl = new URL(`https://${authParams.accountId}.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token`);
    const params = new URLSearchParams({
        [authParams.grantType === 'code' ? 'code' : 'refresh_token']: authParams.grant,
        redirect_uri: `http://localhost:${PORT}`,
        grant_type: authParams.grantType === 'code' ? 'authorization_code' : 'refresh_token',
        code_verifier: authParams.verifier,
        client_id: INTEGRATION_CLIENT_ID,
    });
    const body = params.toString();
    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Host': `${authParams.accountId}.suitetalk.api.netsuite.com`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': body.length.toString(),
        },
        body,
    });
    if (!response.ok) {
        console.log(await response.text());
        throw new Error("Error fetching access token from NetSuite");
    }
    const data: TokenResponse = await response.json();
    if ('error' in data) {
        throw new Error("Error fetching token from NetSuite: " + data.error);
    }
    return {
        access: data.access_token,
        refresh: data.refresh_token,
        expirationDate: dateAddSeconds(new Date(), +data.expires_in)
    }
}

export async function refreshAccessToken(authParams: AuthParams, tokens: AuthTokens): Promise<AuthTokens> {
    return await fetchAccessToken({
        ...authParams,
        grant: tokens.refresh,
        grantType: 'refresh',
    });
}

function dateAddSeconds(date: Date, seconds: number): Date {
    const out = new Date();
    out.setSeconds(date.getSeconds() + seconds);
    return out;
}

type TokenResponse = {
    access_token: string;
    refresh_token: string;
    expires_in: string;
    token_type: string;
} | {
    error: string;
}

export type AuthTokens = {
    access: string;
    refresh: string;
    expirationDate: Date
}


type AuthParams = {
    state: string;
    role: string;
    entity: string;
    realm: string;
    accountId: string;
    grant: string;
    grantType: 'code' | 'refresh'
    verifier: string;
}

function parseSearchFromResponse(raw: string): URLSearchParams | undefined {
    const result = /\?(\S+)/.exec(raw);
    if (!result || result.length < 2) return undefined;
    const search = new URLSearchParams(result[1]);
    return search;
}

function openUrl(url: URL): void {
    console.log(url);
    if (process.platform === 'win32') {
        const winSafeUrl = url.toString().replace(/&/g, '^&');
        exec(`start "${winSafeUrl}"`);
        return;
    }
    const open = process.platform == 'darwin' ? 'open' : 'xdg-open';
    exec(`${open} "${url.toString()}"`);
}
