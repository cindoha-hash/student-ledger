// Student Ledger – App Initialisation (M4/M5/M6/M7)

import {
    loadState,
    fetchRecords,
    setEditingId,
    fetchCurrentSort,
    setCurrentSort,
    setSearchRegex,
    setCapTarget,
    setCurrencySettings,
    setRecords,
    getRecordById,
    addRecord,
    updateRecord,
    deleteRecord,
    makeId,
    nowISO
} from './state.js';

import { validators } from './validators.js';
import { compileRegexSafe } from './search.js';
import {
    buildTable,
    refreshUI,
    goToPage,
    sayStatus
} from './ui.js';

// Internal state (tracking edit mode)
let editingId = null;

function startApp() {
    loadState();

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('form-date').value = today;

    refreshUI();

    // Navigation
    document.querySelectorAll('.app-nav button').forEach(btn => {
        btn.addEventListener('click', function() {
            const page = this.dataset.page;
            if (page === 'add' && editingId) {
                cancelEdit();
            }
            goToPage(page);
        });
    });

    // Form submission
    document.getElementById('transaction-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('form-cancel-btn').addEventListener('click', cancelEdit);
    document.getElementById('form-cancel-btn').style.display = 'none';

    // Search
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', function() {
        const pattern = this.value.trim();
        if (!pattern) {
            setSearchRegex(null);
            buildTable();
            sayStatus('Search cleared.', 'status');
            return;
        }
        const regex = compileRegexSafe(pattern, 'i');
        if (regex) {
            setSearchRegex(regex);
            buildTable();
            sayStatus(`Searching: ${pattern}`, 'status');
        } else {
            setSearchRegex(null);
            buildTable();
            sayStatus(`Invalid regex: ${pattern}`, 'alert');
        }
    });

    document.getElementById('search-clear-btn').addEventListener('click', function() {
        searchInput.value = '';
        setSearchRegex(null);
        buildTable();
        sayStatus('Search cleared.', 'status');
    });

    // Sort
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', function() {
            const field = this.dataset.sort;
            const currentSort = fetchCurrentSort();
            if (currentSort.field === field) {
                currentSort.direction = (currentSort.direction === 'asc') ? 'desc' : 'asc';
            } else {
                currentSort.field = field;
                currentSort.direction = 'asc';
            }
            setCurrentSort(currentSort);
            buildTable();
        });
    });

    // Spending Cap
    document.getElementById('cap-set-btn').addEventListener('click', function() {
        const input = document.getElementById('cap-input');
        const value = parseFloat(input.value);
        if (isNaN(value) || value < 0) {
            sayStatus('Please enter a valid positive number.', 'alert');
            return;
        }
        setCapTarget(value);
        refreshUI();
        sayStatus(`Spending cap set to $${value}`, 'status');
    });

    // M6: Export, Import, Seed, Clear 
    document.getElementById('export-json-btn').addEventListener('click', exportData);
    document.getElementById('settings-export-btn').addEventListener('click', exportData);

    const importFileInput = document.getElementById('import-file-input');
    document.getElementById('import-json-btn').addEventListener('click', () => importFileInput.click());
    document.getElementById('settings-import-btn').addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', function(e) {
        if (this.files.length) {
            importData(this.files[0]);
            this.value = '';
        }
    });

    document.getElementById('seed-btn').addEventListener('click', loadSeed);
    document.getElementById('clear-btn').addEventListener('click', clearAll);
    document.getElementById('settings-clear-btn').addEventListener('click', clearAll);

    // M6: Categories 
    document.getElementById('add-category-btn').addEventListener('click', addCategory);
    document.getElementById('new-category-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCategory();
        }
    });

    //  M6: Currency Settings 
    document.querySelectorAll('#currency-base, #currency-alt1, #currency-alt2, #rate-base-alt1, #rate-base-alt2, #display-currency')
        .forEach(el => {
            el.addEventListener('change', saveCurrencySettings);
        });

    // M7: Escape key to cancel edit 
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && editingId) {
            cancelEdit();
            goToPage('records');
            sayStatus('Edit cancelled.', 'status');
        }
    });

    document.getElementById('records-body').addEventListener('click', function(e) {
        const btn = e.target.closest('.edit-btn, .delete-btn');
        if (!btn) return;
        const id = btn.dataset.id;
        if (btn.classList.contains('edit-btn')) {
            startEdit(id);
        } else if (btn.classList.contains('delete-btn')) {
            deleteTransaction(id);
        }
    });

    sayStatus('Student Ledger ready.', 'status');
}

function handleFormSubmit(e) {
    e.preventDefault();
    clearFieldErrors();

    const description = document.getElementById('form-description').value.trim();
    const amountRaw = document.getElementById('form-amount').value.trim();
    const category = document.getElementById('form-category').value;
    const date = document.getElementById('form-date').value;

    let isValid = true;

    if (!validators.description(description)) {
        showFieldError('desc-error', 'No leading/trailing spaces. Max 60 chars.');
        isValid = false;
    }
    if (description.length > 0 && !validators.complex(description)) {
        const successEl = document.getElementById('desc-success');
        if (successEl) {
            successEl.textContent = 'Tip: include a number, letter, and special char.';
            successEl.classList.add('visible');
        }
    }

    if (!validators.amount(amountRaw) || parseFloat(amountRaw) === 0) {
        showFieldError('amount-error', 'Enter a positive amount (e.g. 12.50).');
        isValid = false;
    }

    if (!validators.date(date)) {
        showFieldError('date-error', 'Enter a valid date (YYYY-MM-DD).');
        isValid = false;
    }

    if (!validators.category(category)) {
        showFieldError('cat-error', 'Only letters, spaces, and hyphens allowed.');
        isValid = false;
    }

    if (!isValid) {
        sayStatus('Please fix the errors in the form.', 'alert');
        return;
    }

    const amount = parseFloat(amountRaw);
    const isEditing = !!editingId;

    if (isEditing) {
        updateRecord(editingId, {
            description,
            amount,
            category,
            date,
            updatedAt: nowISO()
        });
        sayStatus('Transaction updated.', 'status');
    } else {
        const newRecord = {
            id: makeId(),
            description,
            amount,
            category,
            date,
            createdAt: nowISO(),
            updatedAt: nowISO()
        };
        addRecord(newRecord);
        sayStatus('Transaction added.', 'status');
    }

    cancelEdit();
    refreshUI();
}

function startEdit(id) {
    const record = getRecordById(id);
    if (!record) return;

    editingId = id;
    setEditingId(id);

    document.getElementById('edit-id').value = id;
    document.getElementById('form-description').value = record.description;
    document.getElementById('form-amount').value = Math.abs(record.amount).toFixed(2);
    document.getElementById('form-category').value = record.category || 'Other';
    document.getElementById('form-date').value = record.date;

    document.getElementById('add-heading').textContent = 'Edit Transaction';
    document.getElementById('form-submit-btn').textContent = 'Update Transaction';
    document.getElementById('form-cancel-btn').style.display = 'inline-flex';

    goToPage('add');
}

function cancelEdit() {
    editingId = null;
    setEditingId(null);

    document.getElementById('edit-id').value = '';
    document.getElementById('add-heading').textContent = 'Add Transaction';
    document.getElementById('form-submit-btn').textContent = 'Add Transaction';
    document.getElementById('form-cancel-btn').style.display = 'none';

    document.getElementById('transaction-form').reset();
    clearFieldErrors();
}

function deleteTransaction(id) {
    const record = getRecordById(id);
    if (!record) return;

    const amountStr = '$' + Math.abs(record.amount).toFixed(2);
    if (!confirm(`Delete "${record.description}" (${amountStr})?`)) return;

    deleteRecord(id);
    refreshUI();
    sayStatus('Transaction deleted.', 'status');
}

function clearFieldErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.classList.remove('visible'));
    document.querySelectorAll('.field-success').forEach(el => el.classList.remove('visible'));
    document.querySelectorAll('.form-group input, .form-group select').forEach(el => el.classList.remove('error'));
}

function showFieldError(id, msg) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = msg || 'Please fix this field.';
        el.classList.add('visible');
        const input = el.closest('.form-group')?.querySelector('input, select');
        if (input) input.classList.add('error');
    }
}

// M6 – Data Import / Export 

function exportData() {
    const records = fetchRecords();
    const data = JSON.stringify(records, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-ledger-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    sayStatus('Export complete.', 'status');
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (!Array.isArray(data)) {
                throw new Error('Not an array.');
            }
            // Validate each record
            data.forEach((r, i) => {
                if (!r.id || !r.description || typeof r.amount !== 'number' || !r.date) {
                    throw new Error(`Record ${i} is missing required fields (id, description, amount, date).`);
                }
            });
            if (data.length === 0) {
                if (!confirm('The imported file has no records. Continue?')) return;
            }
            setRecords(data);
            refreshUI();
            sayStatus(`Imported ${data.length} records.`, 'status');
        } catch (err) {
            sayStatus(`Import failed: ${err.message}`, 'alert');
        }
    };
    reader.readAsText(file);
}

function loadSeed() {
    fetch('seed.json')
        .then(res => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(data => {
            if (fetchRecords().length > 0) {
                if (!confirm('This will replace all current records. Continue?')) return;
            }
            setRecords(data);
            refreshUI();
            sayStatus('Seed data loaded.', 'status');
        })
        .catch(() => {
            sayStatus('Could not load seed.json. Please ensure the file exists.', 'alert');
        });
}

function clearAll() {
    if (fetchRecords().length === 0) {
        sayStatus('No records to clear.', 'status');
        return;
    }
    if (!confirm('Delete all records? This cannot be undone.')) return;
    setRecords([]);
    refreshUI();
    sayStatus('All records cleared.', 'status');
}

// M6 – Categories

function addCategory() {
    const input = document.getElementById('new-category-input');
    const val = input.value.trim();
    if (!val) {
        sayStatus('Please enter a category name.', 'alert');
        return;
    }
    if (!validators.category(val)) {
        sayStatus('Category must contain only letters, spaces, or hyphens.', 'alert');
        return;
    }
    // Check if it already exists
    const existing = document.querySelectorAll('#category-list .setting-row span');
    for (const el of existing) {
        if (el.textContent.toLowerCase() === val.toLowerCase()) {
            sayStatus('Category already exists.', 'alert');
            return;
        }
    }

    const row = document.createElement('div');
    row.className = 'setting-row';
    row.style.cssText = 'border-bottom:1px solid var(--color-border);padding:var(--space-xs) 0;';
    row.innerHTML = `<span style="flex:1;font-size:0.875rem;">${val}</span>`;
    document.getElementById('category-list').appendChild(row);
    input.value = '';

    const sel = document.getElementById('form-category');
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = val;
    sel.appendChild(opt);
    sayStatus(`Category "${val}" added.`, 'status');
}

// M6 – Currency Settings

function saveCurrencySettings() {
    const base = document.getElementById('currency-base').value;
    const alt1 = document.getElementById('currency-alt1').value;
    const alt2 = document.getElementById('currency-alt2').value;
    const rate1 = parseFloat(document.getElementById('rate-base-alt1').value) || 1;
    const rate2 = parseFloat(document.getElementById('rate-base-alt2').value) || 1;
    const display = document.getElementById('display-currency').value;

    setCurrencySettings({ base, alt1, alt2, rateAlt1: rate1, rateAlt2: rate2, display });
    refreshUI();
    sayStatus('Currency settings saved.', 'status');
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', startApp);