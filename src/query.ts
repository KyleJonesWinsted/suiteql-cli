import { AuthInfo } from "./auth";

export async function runQuery(authInfo: AuthInfo, query: string): Promise<Record<string, unknown>> {
    const baseUrl = new URL(`https://${authInfo.accountId}.suitetalk.api.netsuite.com/services/rest/query/v1/suiteql`);
    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            Prefer: 'transient',
            Authorization: 'Bearer ' + authInfo.access,
        },
        body: JSON.stringify({ q: query }),
    });
    const data = await response.json();
    if (response.status !== 200) {
        const detail = data['o:errorDetails']?.[0]?.detail;
        console.error('Error running query: ' + detail);
        process.exit(1);
    }
    // TODO: handle multiple pages
    return data.items;
}