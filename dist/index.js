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
const csv_encode_1 = require("./csv-encode");
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
            yield (0, storage_1.storeAccountInfo)(accountInfo, args.account);
        }
    }
    if (!accountInfo) {
        const response = yield (0, auth_1.fetchAuthCode)();
        accountInfo = yield (0, auth_1.fetchAccessToken)(response);
        yield (0, storage_1.storeAccountInfo)(accountInfo, args.account);
    }
    const results = yield (0, query_1.runQuery)(accountInfo, args.query);
    switch (args.outputType) {
        case arguments_1.OutputType.table:
            return console.table(results);
        case arguments_1.OutputType.csv:
            return console.log((0, csv_encode_1.encodeCsv)(results));
        case arguments_1.OutputType.json:
            return console.log(JSON.stringify(results));
    }
}))();
