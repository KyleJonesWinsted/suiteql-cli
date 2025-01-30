

type Input = Array<Record<string, string>>;

export function encodeCsv(input: Input): string {
    const headers = parseHeaders(input);
    let out = '';
    out += headers.map((h) => encodeCsvComponent(h)).join(',') + '\n';
    for (const row of input) {
        out += headers.map((h) => encodeCsvComponent(row[h] ?? '')) + '\n';
    }
    return out;
}

function parseHeaders(input: Input): string[] {
    const out = new Set<string>();
    for (const row of input) {
        for (const key of Object.keys(row)) {
            out.add(key);
        }
    }
    return Array.from(out.keys());
}

function encodeCsvComponent(s: string): string {
    if (!containsControlCharacters(s)) {
        return s;
    }
    return '"' + s.replace(/"/g, '""') + '"';
}

function containsControlCharacters(s: string): boolean {
    const controlCharacters = [',', '"', '\n', '\r', '\l'];
    return s.split('').some((c) => controlCharacters.includes(c));
}
