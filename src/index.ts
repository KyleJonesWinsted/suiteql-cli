#! env node

import { OutputType, parseArguments } from "./arguments";
import { fetchAccessToken, fetchAuthCode, refreshAccessToken } from "./auth";
import { encodeCsv } from "./csv-encode";
import { runQuery } from "./query";
import { getAccountInfo, storeAccountInfo, updateLastUsed } from "./storage";

(async () => {

    const args = await parseArguments();
    let accountInfo = await getAccountInfo(args.account);
    let isNewToken = false;
    let deferredStorage = undefined;
    if (accountInfo && new Date(accountInfo?.expirationDate) < new Date()) {
        isNewToken = true;
        try {
            accountInfo = await refreshAccessToken(accountInfo);
        } catch {
            const response = await fetchAuthCode(accountInfo.accountId);
            accountInfo = await fetchAccessToken(response);
        }
        deferredStorage = storeAccountInfo(accountInfo, args.account);
    }
    if (!accountInfo) {
        isNewToken = true;
        const response = await fetchAuthCode();
        accountInfo = await fetchAccessToken(response);
        deferredStorage = storeAccountInfo(accountInfo, args.account);
    }

    if (!isNewToken) {
        deferredStorage = updateLastUsed(accountInfo);
    }

    const results = await runQuery(accountInfo, args.query);

    await deferredStorage;

    switch (args.outputType) {
        case OutputType.table:
            return console.table(results);
        case OutputType.csv:
            return process.stdout.write(encodeCsv(results));
        case OutputType.json:
            return console.log(JSON.stringify(results));
    }

})();

