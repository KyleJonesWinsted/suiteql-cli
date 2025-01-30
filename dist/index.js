#! env node
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
Object.defineProperty(exports, "__esModule", { value: true });
const arguments_1 = require("./arguments");
const auth_1 = require("./auth");
const query_1 = require("./query");
const storage_1 = require("./storage");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const args = yield (0, arguments_1.parseArguments)();
    let accountInfo = yield (0, storage_1.getAccountInfo)(args.account);
    if (accountInfo && new Date(accountInfo === null || accountInfo === void 0 ? void 0 : accountInfo.expirationDate) < new Date()) {
        try {
            accountInfo = yield (0, auth_1.refreshAccessToken)(accountInfo);
        }
        catch (_a) {
            const response = yield (0, auth_1.fetchAuthCode)(accountInfo.accountId);
            accountInfo = yield (0, auth_1.fetchAccessToken)(response);
        }
    }
    if (!accountInfo) {
        const response = yield (0, auth_1.fetchAuthCode)();
        accountInfo = yield (0, auth_1.fetchAccessToken)(response);
    }
    yield (0, storage_1.storeAccountInfo)(accountInfo, args.account);
    const states = yield (0, query_1.runQuery)(accountInfo, args.query);
    console.table(states);
    /**
     * TODO:
     *  fetch token
     *      if account provided, look in file for tokens
     *      else start server on port, open browser for oauth2.0
     *      receive code grant and exchange for tokens
     *      if account name provided, store tokens in file
     *
     *  attempt query with token
     *      if fails, attempt token refresh
     *      if fails, open browser for auth (unless already tried)
     *      if fails, display error to user
     */
}))();
