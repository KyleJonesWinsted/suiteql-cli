"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usageString = exports.parseArguments = exports.OutputType = exports.argumentFlags = void 0;
const fs_1 = require("fs");
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
    if (process.argv.length < 3 || process.argv.includes('-help')) {
        console.log(exports.usageString);
        return process.exit(0);
    }
    const queryFilePath = parseArgument(exports.argumentFlags.queryFile);
    let queryString = parseArgument(exports.argumentFlags.queryString);
    if (!queryFilePath && !queryString) {
        console.log('Missing arguments: You must supply either a query string or query file.');
        return process.exit(1);
    }
    const query = queryString || readQueryFile(queryFilePath);
    const outputType = getOutputType();
    return {
        account: parseArgument(exports.argumentFlags.account),
        query,
        outputType,
    };
}
exports.parseArguments = parseArguments;
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
`;
