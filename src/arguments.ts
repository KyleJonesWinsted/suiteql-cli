import { readFileSync } from "fs";

export const argumentFlags = {
    account: '-a',
    queryString: '-s',
    queryFile: '-f'
}

export type Args = {
    account: string | undefined,
    query: string
}

export function parseArguments(): Args {
    if (process.argv.length < 3 || process.argv.includes('-help')) {
        console.log(usageString);
        return process.exit(0);
    }
    const queryFilePath = parseArgument(argumentFlags.queryFile);
    let queryString = parseArgument(argumentFlags.queryString);
    if (!queryFilePath && !queryString) {
        console.log('Missing arguments: You must supply either a query string or query file.');
        return process.exit(1);
    }
    const query = queryString || readQueryFile(queryFilePath);
    return {
        account: parseArgument(argumentFlags.account),
        query,
    }
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

    -a  Account number/name to run query against. 
        If none is provided, or the token is expired, 
        you will be prompted to login via the browser

    -s  Query string to run. A file can be used instead 
        with "-f"
    
    -f  File path containing a query to run. A string can be
        used instead with "-s"
`;
