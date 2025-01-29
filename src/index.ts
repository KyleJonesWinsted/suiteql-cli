#! env node

import { parseArguments } from "./arguments";
import { fetchAuthCode, fetchIntegrationToken } from "./auth";

(async () => {

    const token = await fetchIntegrationToken();
    const response = await fetchAuthCode(token);
    console.log(response);


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

