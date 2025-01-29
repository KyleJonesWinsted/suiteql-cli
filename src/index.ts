#! env node

import { parseArguments } from "./arguments";
import { fetchAccessToken, fetchAuthCode, refreshAccessToken } from "./auth";
import { runQuery } from "./query";
import { getAccountInfo, storeAccountInfo } from "./storage";

(async () => {

    let accessToken = await getAccountInfo();
    if (!accessToken || accessToken.expirationDate < new Date()) {
        const response = await fetchAuthCode();
        accessToken = await fetchAccessToken(response);
    }
    await storeAccountInfo(accessToken);

    const states = await runQuery(accessToken, "SELECT * FROM state");
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

