// safe regex compiler and text highlighting

export function compileRegexSafe(pattern, flags = 'i') {
    try {
        if (!pattern) return null;
        pattern = pattern.trim();
        let finalPattern = pattern;
        let finalFlags = flags;

        const match = pattern.match(/^\/(.+)\/([gimsuy]*)$/);
        if (match) {
            finalPattern = match[1];
            if (match[2]) {
                finalFlags = match[2];
            }
        }
        return new RegExp(finalPattern, finalFlags);
    } catch (_) {
        return null;
    }
}

export function highlightText(text, re) {
    if (!re || !text) return text;
    return text.replace(re, (m) => `<mark>${m}</mark>`);
}

