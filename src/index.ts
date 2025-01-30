#! env node

import { parseArguments } from "./arguments";
import { fetchAccessToken, fetchAuthCode, refreshAccessToken } from "./auth";
import { runQuery } from "./query";
import { getAccountInfo, storeAccountInfo } from "./storage";

(async () => {

    const args = await parseArguments()
    let accountInfo = await getAccountInfo(args.account);
    if (accountInfo && new Date(accountInfo?.expirationDate) < new Date()) {
        try {
            accountInfo = await refreshAccessToken(accountInfo);
        } catch {
            const response = await fetchAuthCode(accountInfo.accountId);
            accountInfo = await fetchAccessToken(response);
        }
    }
    if (!accountInfo) {
        const response = await fetchAuthCode();
        accountInfo = await fetchAccessToken(response);
    }
    await storeAccountInfo(accountInfo, args.account);

    const states = await runQuery(accountInfo, args.query);
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


})();

