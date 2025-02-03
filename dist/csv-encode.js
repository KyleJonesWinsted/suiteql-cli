"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeCsv = void 0;
function encodeCsv(input) {
    const headers = parseHeaders(input);
    let out = '';
    out += headers.map((h) => encodeCsvComponent(h)).join(',') + '\r\n';
    for (const row of input) {
        out += headers.map((h) => { var _a; return encodeCsvComponent((_a = row[h]) !== null && _a !== void 0 ? _a : ''); }) + '\r\n';
    }
    return out;
}
exports.encodeCsv = encodeCsv;
function parseHeaders(input) {
    const out = new Set();
    for (const row of input) {
        for (const key of Object.keys(row)) {
            out.add(key);
        }
    }
    return Array.from(out.keys());
}
function encodeCsvComponent(s) {
    if (!containsControlCharacters(s)) {
        return s;
    }
    return '"' + s.replace(/"/g, '""') + '"';
}
function containsControlCharacters(s) {
    const controlCharacters = [',', '"', '\n', '\r'];
    return s.split('').some((c) => controlCharacters.includes(c));
}
