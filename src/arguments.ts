import { readFileSync } from "fs";
import { resetAllAccountInfo } from "./storage";

export const argumentFlags = {
    account: '-a',
    queryString: '-s',
    queryFile: '-f'
}

export enum OutputType {
    table,
    csv,
    json
}

export type Args = {
    account: string | undefined,
    query: string,
    outputType: OutputType
}

export async function parseArguments(): Promise<Args> {
    if (process.argv.includes('-reset')) {
        await resetAllAccountInfo();
        console.error('All account have been removed.');
        return process.exit(0);
    }
    if (process.argv.includes('-help')) {
        console.log(usageString);
        return process.exit(0);
    }
    const queryFilePath = parseArgument(argumentFlags.queryFile);
    let queryString = parseArgument(argumentFlags.queryString);
    if (!queryFilePath && !queryString) {
        console.error("Enter a query:");
        for await (const chunk of process.stdin) {
            queryString = chunk.toString();
            break;
        }
    }
    const query = queryString || readQueryFile(queryFilePath);
    const outputType = getOutputType();
    return {
        account: parseArgument(argumentFlags.account),
        query,
        outputType,
    }
}

function getOutputType(): OutputType {
    let outputType = OutputType.table;
    if (process.argv.includes('-csv')) {
        outputType = OutputType.csv;
    }
    if (process.argv.includes('-json')) {
        outputType = OutputType.json;
    }
    return outputType;
}

function readQueryFile(filePath: string | undefined): string {
    if (!filePath) return '';
    const contents = readFileSync(filePath);
    return contents.toString();
}

function parseArgument(flag: string): string | undefined {
    const index = process.argv.findIndex(arg => arg === flag);
    if (index < 0 || index + 1 >= process.argv.length) {
        return;
    }
    return process.argv[index + 1];
}

export const usageString = `
Usage:

    -a      Account number/name to run query against. 
            If none is provided, the last used account will be used

    -s      Query string to run. A file can be used instead 
            with "-f"
    
    -f      File path containing a query to run. A string can be
            used instead with "-s"

    -csv    Outputs results as CSV. Default output is a table

    -json   Outputs results as JSON. Default output is a table

    -reset  Removes all account authentication data.

`;
