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
exports.runQuery = void 0;
function runQuery(authInfo, query) {
    return __awaiter(this, void 0, void 0, function* () {
        const output = [];
        let offset = 0;
        let hasMore = true;
        while (hasMore) {
            const data = yield fetchData(authInfo, query, offset);
            output.push(...data.items.map((item) => {
                delete item.links;
                return item;
            }));
            hasMore = data.hasMore;
            offset += 1000;
        }
        return output;
    });
}
exports.runQuery = runQuery;
function fetchData(authInfo, query, offset) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const baseUrl = new URL(`https://${authInfo.accountId}.suitetalk.api.netsuite.com/services/rest/query/v1/suiteql?offset=${offset}`);
        const response = yield fetch(baseUrl, {
            method: 'POST',
            headers: {
                Prefer: 'transient',
                Authorization: 'Bearer ' + authInfo.access,
            },
            body: JSON.stringify({ q: query }),
        });
        const data = yield response.json();
        if (response.status !== 200) {
            const detail = (_b = (_a = data['o:errorDetails']) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.detail;
            console.error('Error running query: ' + detail);
            process.exit(1);
        }
        return data;
    });
}
