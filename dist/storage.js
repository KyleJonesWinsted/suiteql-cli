"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAccountInfo = exports.resetAllAccountInfo = exports.updateLastUsed = exports.storeAccountInfo = exports.getAccountInfo = void 0;
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs/promises"));
const fs_1 = require("fs");
const STORAGE_FILE_PATH = path_1.default.join(__dirname, 'creds.json');
const LAST_USED_ACCOUNT_NAME = '___lastused___';
function getAccountInfo() {
    return __awaiter(this, arguments, void 0, function* (accountName = LAST_USED_ACCOUNT_NAME) {
        const info = yield getAllAccountInfo();
        return info[accountName];
    });
}
exports.getAccountInfo = getAccountInfo;
function storeAccountInfo(authInfo, accountName) {
    return __awaiter(this, void 0, void 0, function* () {
        const info = yield getAllAccountInfo();
        info[accountName !== null && accountName !== void 0 ? accountName : authInfo.realm] = authInfo;
        info[LAST_USED_ACCOUNT_NAME] = authInfo;
        yield fs.writeFile(STORAGE_FILE_PATH, JSON.stringify(info));
    });
}
exports.storeAccountInfo = storeAccountInfo;
function updateLastUsed(authInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        const info = yield getAllAccountInfo();
        info[LAST_USED_ACCOUNT_NAME] = authInfo;
        yield fs.writeFile(STORAGE_FILE_PATH, JSON.stringify(info));
    });
}
exports.updateLastUsed = updateLastUsed;
function resetAllAccountInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs.rm(STORAGE_FILE_PATH);
        yield fs.writeFile(STORAGE_FILE_PATH, '{}');
    });
}
exports.resetAllAccountInfo = resetAllAccountInfo;
function getAllAccountInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(0, fs_1.existsSync)(STORAGE_FILE_PATH)) {
            return {};
        }
        const data = (yield fs.readFile(STORAGE_FILE_PATH)).toString();
        try {
            return JSON.parse(data);
        }
        catch (err) {
            yield fs.rm(STORAGE_FILE_PATH);
            return {};
        }
    });
}
exports.getAllAccountInfo = getAllAccountInfo;
