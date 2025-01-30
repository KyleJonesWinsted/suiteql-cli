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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usageString = exports.parseArguments = exports.OutputType = exports.argumentFlags = void 0;
const fs_1 = require("fs");
const storage_1 = require("./storage");
exports.argumentFlags = {
    account: '-a',
    queryString: '-s',
    queryFile: '-f'
};
var OutputType;
(function (OutputType) {
    OutputType[OutputType["table"] = 0] = "table";
    OutputType[OutputType["csv"] = 1] = "csv";
    OutputType[OutputType["json"] = 2] = "json";
})(OutputType || (exports.OutputType = OutputType = {}));
function parseArguments() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        if (process.argv.includes('-reset')) {
            yield (0, storage_1.resetAllAccountInfo)();
            console.error('All account have been removed.');
            return process.exit(0);
        }
        if (process.argv.includes('-list')) {
            yield printAccounts();
            return process.exit(0);
        }
        if (process.argv.includes('-help')) {
            console.log(exports.usageString);
            return process.exit(0);
        }
        const queryFilePath = parseArgument(exports.argumentFlags.queryFile);
        let queryString = parseArgument(exports.argumentFlags.queryString);
        if (!queryFilePath && !queryString) {
            try {
                for (var _d = true, _e = __asyncValues(process.stdin), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const chunk = _c;
                    queryString = chunk.toString();
                    break;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        const query = queryString || readQueryFile(queryFilePath);
        const outputType = getOutputType();
        return {
            account: parseArgument(exports.argumentFlags.account),
            query,
            outputType,
        };
    });
}
exports.parseArguments = parseArguments;
function printAccounts() {
    return __awaiter(this, void 0, void 0, function* () {
        const allAccounts = yield (0, storage_1.getAllAccountInfo)();
        const now = new Date();
        const data = Object.entries(allAccounts).map(([name, info]) => ({
            Name: name,
            Account: info.realm,
            'Is Expired': new Date(info.expirationDate) < now,
        }));
        data.sort((a, b) => a.Account.localeCompare(b.Account));
        console.table(data);
    });
}
function getOutputType() {
    let outputType = OutputType.table;
    if (process.argv.includes('-csv')) {
        outputType = OutputType.csv;
    }
    if (process.argv.includes('-json')) {
        outputType = OutputType.json;
    }
    return outputType;
}
function readQueryFile(filePath) {
    if (!filePath)
        return '';
    const contents = (0, fs_1.readFileSync)(filePath);
    return contents.toString();
}
function parseArgument(flag) {
    const index = process.argv.findIndex(arg => arg === flag);
    if (index < 0 || index + 1 >= process.argv.length) {
        return;
    }
    return process.argv[index + 1];
}
exports.usageString = `
Usage:

    -a      Account number/name to run query against. 
            If none is provided, the last used account will be used

    -s      Query string to run. A file can be used instead 
            with "-f"
    
    -f      File path containing a query to run. A string can be
            used instead with "-s"

    -csv    Outputs results as CSV. Default output is a table

    -json   Outputs results as JSON. Default output is a table

    -list   Lists all accounts and their expiration status

    -reset  Removes all account authentication data.

`;
