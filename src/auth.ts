import { exec } from "child_process";
import { getStringFromServer, PORT } from "./local-server";
import crypto from 'crypto';

export type Token = {
    id: string;
    secret: string;
}

export async function fetchIntegrationToken(): Promise<Token> {
    const path = '/creds/suiteql-cli.txt';
    const response = await fetch('https://kylejon.es' + path);
    if (!response.ok) {
        throw new Error('Unable to fetch integration tokens from server.');
    }
    const data = await response.text();
    const [id, secret] = data.split('\n');
    if (!id || !secret) {
        throw new Error("Unable to decode integration tokens from server.");
    }
    return { id, secret };
}


export async function fetchAuthCode(integrationToken: Token, accountId: string = 'system'): Promise<AuthParams> {
    const baseUrl = new URL(`https://${accountId}.netsuite.com/app/login/oauth2/authorize.nl`);
    const verifier = crypto.randomUUID() + crypto.randomUUID();
    const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
    const params = new URLSearchParams({
        'response_type': 'code',
        'client_id': integrationToken.id,
        'redirect_uri': `http://localhost:${PORT}`,
        'scope': 'suite_analytics',
        'state': crypto.randomUUID(),
        'code_challenge': challenge,
        'code_challenge_method': 'S256',
    });
    openUrl(baseUrl + '?' + params.toString());
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
        code: search.get('code') ?? '',
        verifier,
    };
}

type AuthParams = {
    state: string;
    role: string;
    entity: string;
    realm: string;
    accountId: string;
    code: string;
    verifier: string;
}

function parseSearchFromResponse(raw: string): URLSearchParams | undefined {
    const result = /\?(\S+)/.exec(raw);
    if (!result || result.length < 2) return undefined;
    const search = new URLSearchParams(result[1]);
    return search;
}

function openUrl(url: string): void {
    console.log(url);
    if (process.platform === 'win32') {
        const winSafeUrl = url.replace(/&/g, '^&');
        exec(`start "${winSafeUrl}"`);
        return;
    }
    const open = process.platform == 'darwin' ? 'open' : 'xdg-open';
    exec(`${open} "${url}"`);
}
