"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAccessToken = exports.fetchAccessToken = exports.fetchAuthCode = void 0;
const child_process_1 = require("child_process");
const local_server_1 = require("./local-server");
const crypto_1 = __importDefault(require("crypto"));
const INTEGRATION_CLIENT_ID = 'db01e9b87906c711f3887d195c26bf38d218c69ce305b7f5a352daa0beb1dccf';
function fetchAuthCode(accountId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g;
        const subdomain = accountId ? accountId + '.app' : 'system';
        const baseUrl = new URL(`https://${subdomain}.netsuite.com/app/login/oauth2/authorize.nl`);
        const verifier = crypto_1.default.randomUUID() + crypto_1.default.randomUUID();
        const challenge = crypto_1.default.createHash('sha256').update(verifier).digest('base64url');
        const params = new URLSearchParams({
            'response_type': 'code',
            'client_id': INTEGRATION_CLIENT_ID,
            'redirect_uri': `http://localhost:${local_server_1.PORT}`,
            'scope': 'restlets rest_webservices suite_analytics',
            'state': crypto_1.default.randomUUID(),
            'code_challenge': challenge,
            'code_challenge_method': 'S256',
        });
        baseUrl.search = params.toString();
        console.error('Please continue to login in browser...');
        openUrl(baseUrl);
        const rawResponse = yield (0, local_server_1.getStringFromServer)();
        const search = parseSearchFromResponse(rawResponse);
        if (!search) {
            throw new Error('Failed to get response from NetSuite');
        }
        if (search.get('error')) {
            throw new Error('Login error: ' + search.get('error'));
        }
        return {
            state: (_a = search.get('state')) !== null && _a !== void 0 ? _a : '',
            role: (_b = search.get('role')) !== null && _b !== void 0 ? _b : '',
            entity: (_c = search.get('entity')) !== null && _c !== void 0 ? _c : '',
            realm: (_d = search.get('company')) !== null && _d !== void 0 ? _d : '',
            accountId: (_f = (_e = search.get('company')) === null || _e === void 0 ? void 0 : _e.toLowerCase().replace('_', '-')) !== null && _f !== void 0 ? _f : '',
            code: (_g = search.get('code')) !== null && _g !== void 0 ? _g : '',
            verifier,
        };
    });
}
exports.fetchAuthCode = fetchAuthCode;
function fetchAccessToken(authParams) {
    return __awaiter(this, void 0, void 0, function* () {
        const baseUrl = new URL(`https://${authParams.accountId}.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token`);
        const params = new URLSearchParams({
            code: authParams.code,
            redirect_uri: `http://localhost:${local_server_1.PORT}`,
            grant_type: 'authorization_code',
            code_verifier: authParams.verifier,
            client_id: INTEGRATION_CLIENT_ID,
        });
        const body = params.toString();
        const response = yield fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Host': `${authParams.accountId}.suitetalk.api.netsuite.com`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': body.length.toString(),
            },
            body,
        });
        if (!response.ok) {
            throw new Error("Error fetching access token from NetSuite");
        }
        const data = yield response.json();
        if ('error' in data) {
            throw new Error("Error fetching token from NetSuite: " + data.error);
        }
        return {
            access: data.access_token,
            refresh: data.refresh_token,
            expirationDate: dateAddSeconds(new Date(), +data.expires_in).toString(),
            accountId: authParams.accountId,
            realm: authParams.realm,
        };
    });
}
exports.fetchAccessToken = fetchAccessToken;
function refreshAccessToken(authInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        const baseUrl = new URL(`https://${authInfo.accountId}.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token`);
        const params = new URLSearchParams({
            refresh_token: authInfo.refresh,
            grant_type: 'refresh_token',
            client_id: INTEGRATION_CLIENT_ID,
        });
        const body = params.toString();
        const response = yield fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Host': `${authInfo.accountId}.suitetalk.api.netsuite.com`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': body.length.toString(),
            },
            body,
        });
        if (!response.ok) {
            throw new Error("Error refreshing token from NetSuite");
        }
        const data = yield response.json();
        if ('error' in data) {
            throw new Error("Error refreshing token from NetSuite: " + data.error);
        }
        return {
            access: data.access_token,
            refresh: data.refresh_token,
            expirationDate: dateAddSeconds(new Date(), +data.expires_in).toString(),
            accountId: authInfo.accountId,
            realm: authInfo.realm,
        };
    });
}
exports.refreshAccessToken = refreshAccessToken;
function dateAddSeconds(date, seconds) {
    const out = new Date();
    out.setSeconds(date.getSeconds() + seconds);
    return out;
}
function parseSearchFromResponse(raw) {
    const result = /\?(\S+)/.exec(raw);
    if (!result || result.length < 2)
        return undefined;
    const search = new URLSearchParams(result[1]);
    return search;
}
function openUrl(url) {
    if (process.platform === 'win32') {
        const winSafeUrl = url.toString().replace(/&/g, '^&');
        (0, child_process_1.exec)(`start "${winSafeUrl}"`);
        return;
    }
    const open = process.platform == 'darwin' ? 'open' : 'xdg-open';
    (0, child_process_1.exec)(`${open} "${url.toString()}"`);
}
