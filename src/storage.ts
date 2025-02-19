import path from "path";
import { AuthInfo } from "./auth";
import * as fs from 'fs/promises';
import { existsSync } from "fs";

const STORAGE_FILE_PATH = path.join(__dirname, 'creds.json');
const LAST_USED_ACCOUNT_NAME = '___lastused___';

export async function getAccountInfo(accountName: string = LAST_USED_ACCOUNT_NAME): Promise<AuthInfo | undefined> {
    const info = await getAllAccountInfo();
    return info[accountName];
}

export async function storeAccountInfo(authInfo: AuthInfo, accountName?: string): Promise<void> {
    const info = await getAllAccountInfo();
    if (!accountName) {
        const matchingRealms = Object.entries(info).filter(([_, value]) => value.realm === authInfo.realm);
        if (matchingRealms.length < 1) {
            info[authInfo.realm] = authInfo;
        }
        matchingRealms.forEach(([key, _]) => {
            info[key] = authInfo;
        });
    } else {
        info[accountName] = authInfo;
    }
    info[LAST_USED_ACCOUNT_NAME] = authInfo;
    await fs.writeFile(STORAGE_FILE_PATH, JSON.stringify(info));
}

export async function updateLastUsed(authInfo: AuthInfo): Promise<void> {
    const info = await getAllAccountInfo();
    info[LAST_USED_ACCOUNT_NAME] = authInfo;
    await fs.writeFile(STORAGE_FILE_PATH, JSON.stringify(info));
}

export async function resetAllAccountInfo(): Promise<void> {
    await fs.rm(STORAGE_FILE_PATH);
    await fs.writeFile(STORAGE_FILE_PATH, '{}');
}

export async function getAllAccountInfo(): Promise<Record<string, AuthInfo>> {
    if (!existsSync(STORAGE_FILE_PATH)) {
        return {};
    }
    const data = (await fs.readFile(STORAGE_FILE_PATH)).toString();
    try {
        return JSON.parse(data);
    } catch (err) {
        await fs.rm(STORAGE_FILE_PATH);
        return {};
    }
}

