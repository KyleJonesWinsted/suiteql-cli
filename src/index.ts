#! env node

import { parseArguments } from "./arguments";
import { fetchAccessToken, fetchAuthCode, refreshAccessToken } from "./auth";

(async () => {

    const response = await fetchAuthCode();
    console.log(response);

    const accessToken = await fetchAccessToken(response);
    console.log(accessToken);

    const refreshedToken = await refreshAccessToken(response, accessToken);

    console.log(refreshedToken);
    console.log(accessToken.refresh === refreshedToken.refresh);

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

