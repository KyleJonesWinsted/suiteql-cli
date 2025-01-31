import { AuthInfo } from "./auth";

export async function runQuery(authInfo: AuthInfo, query: string): Promise<Array<Record<string, string>>> {
    const output: Array<Record<string, string>> = [];
    let offset = 0;
    let hasMore = true;
    while (hasMore) {
        const data = await fetchData(authInfo, query, offset);
        output.push(...data.items.map((item: any) => {
            delete item.links;
            return item;
        }));
        hasMore = data.hasMore;
        offset += 1000;
    }
    return output;
}

async function fetchData(authInfo: AuthInfo, query: string, offset: number): Promise<SuccessResponse> {
    const baseUrl = new URL(`https://${authInfo.accountId}.suitetalk.api.netsuite.com/services/rest/query/v1/suiteql?offset=${offset}`);
    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            Prefer: 'transient',
            Authorization: 'Bearer ' + authInfo.access,
        },
        body: JSON.stringify({ q: query }),
    });
    const data: QueryResponse = await response.json();
    if (response.status !== 200) {
        const detail = (<ErrorResponse>data)['o:errorDetails']?.[0]?.detail;
        console.error('Error running query: ' + detail);
        process.exit(1);
    }
    return <SuccessResponse>data;
}

type QueryResponse = SuccessResponse | ErrorResponse;

type SuccessResponse = {
    links: Link[];
    count: number;
    hasMore: boolean;
    items: Item[];
    offset: number;
    totalResults: number;
}

type Item = Record<string, string>

type Link = {
    rel: string;
    href: string;
}

type ErrorResponse = {
    type: string;
    title: string;
    status: number;
    "o:errorDetails": OErrorDetail[];
}

type OErrorDetail = {
    detail: string;
    "o:errorQueryParam": string;
    "o:errorCode": string;
}

