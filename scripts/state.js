 /* M4/M5 State Management */
import { loadRecords, saveRecords, loadSettings, saveSettings } from './storage.js';

let records = [];
let editingId = null;
let currentSort = { field: 'date', direction: 'desc' };
let searchRegex = null;
let capTarget = 2500;
let currencySettings = {
    base: 'USD',
    alt1: 'EUR',
    alt2: 'GBP',
    rateAlt1: 1.02,
    rateAlt2: 1.42,
    display: 'base'
};

export function loadState() {
    records = loadRecords();
    const settings = loadSettings();
    if (typeof settings.capTarget === 'number') capTarget = settings.capTarget;
    if (settings.currency) {
        currencySettings = { ...currencySettings, ...settings.currency };
    }
}

export function makeId() {
    const count = records.length + 1;
    return 'txn_' + String(count).padStart(4, '0');
}

export function nowISO() {
    return new Date().toISOString();
}
export function fetchRecords() { return records; }
export function fetchEditingId() { return editingId; }
export function fetchCurrentSort() { return currentSort; }
export function fetchSearchRegex() { return searchRegex; }
export function fetchCapTarget() { return capTarget; }
export function fetchCurrencySettings() { return currencySettings; }

export function setRecords(newRecords) {
    records = newRecords;
    saveRecords(records);
}

export function setEditingId(id) { editingId = id; }
export function setCurrentSort(sort) { currentSort = sort; }
export function setSearchRegex(regex) { searchRegex = regex; }

export function setCapTarget(target) {
    capTarget = target;
    const settings = loadSettings();
    settings.capTarget = target;
    saveSettings(settings);
}

export function setCurrencySettings(newSettings) {
    currencySettings = { ...currencySettings, ...newSettings };
    const settings = loadSettings();
    settings.currency = currencySettings;
    saveSettings(settings);
}

export function getRecordById(id) {
    return records.find(r => r.id === id);
}

export function updateRecord(id, updates) {
    const idx = records.findIndex(r => r.id === id);
    if (idx !== -1) {
        records[idx] = { ...records[idx], ...updates };
        saveRecords(records);
        return true;
    }
    return false;
}

export function addRecord(record) {
    records.push(record);
    saveRecords(records);
}

export function deleteRecord(id) {
    records = records.filter(r => r.id !== id);
    saveRecords(records);
}

