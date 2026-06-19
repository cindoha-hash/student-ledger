// localStorage helpers – saves and loads data

const STORAGE_KEY = 'studentLedger:data';
const SETTINGS_KEY = 'studentLedger:settings';

export function loadRecords() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (_) {}
    return [];
}

export function saveRecords(records) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function loadSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return parsed;
        }
    } catch (_) {}
    return {};
}

export function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}