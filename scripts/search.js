// Search utilities – safe regex compiler and text highlighting

export function compileRegexSafe(pattern, flags = 'i') {
    try {
        if (!pattern) return null;
        return new RegExp(pattern, flags);
    } catch (_) {
        return null;
    }
}

export function highlightText(text, re) {
    if (!re || !text) return text;
    return text.replace(re, (m) => `<mark>${m}</mark>`);
}