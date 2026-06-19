// ================================================================
// REFERENCE – M4/M5 App Initialisation
// YOU MUST CHANGE: event listener style, function names, logic flow
// ================================================================

import {
    loadState, getRecords, getEditingId, setEditingId, setCurrentSort,
    setSearchRegex, setCapTarget, setCurrencySettings,
    findRecord, addRecord, updateRecord, deleteRecord, generateId, nowISO
} from './state.js';
import { validators } from './validators.js';
import { compileRegexSafe } from './search.js';
import { renderAll, renderRecords, navigateTo, announce } from './ui.js';

let editingId = null;

// ---------- CHANGE: rename init → startup ----------
function init() {
    loadState();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('form-date').value = today;

    renderAll();

    // ---------- CHANGE: use named functions instead of anonymous ----------
    document.querySelectorAll('.app-nav button').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            if (page === 'add' && editingId) cancelEdit();
            navigateTo(page);
        });
    });

    document.getElementById('transaction-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('form-cancel-btn').addEventListener('click', cancelEdit);
    document.getElementById('form-cancel-btn').style.display = 'none';

    // ---------- CHANGE: rewrite search listener logic ----------
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => {
        const raw = searchInput.value.trim();
        if (!raw) {
            setSearchRegex(null);
            renderRecords();
            announce('Search cleared.', 'status');
            return;
        }
        const re = compileRegexSafe(raw, 'i');
        if (re) {
            setSearchRegex(re);
            renderRecords();
            announce(`Searching for pattern: ${raw}`, 'status');
        } else {
            setSearchRegex(null);
            announce(`Invalid regex pattern: ${raw}`, 'alert');
            renderRecords();
        }
    });
    document.getElementById('search-clear-btn').addEventListener('click', () => {
        searchInput.value = '';
        setSearchRegex(null);
        renderRecords();
        announce('Search cleared.', 'status');
    });

    // ---------- CHANGE: rewrite sort listener ----------
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.dataset.sort;
            const currentSort = getCurrentSort();
            if (currentSort.field === field) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.field = field;
                currentSort.direction = 'asc';
            }
            setCurrentSort(currentSort);
            renderRecords();
        });
    });

    // ---------- CHANGE: cap handler ----------
    document.getElementById('cap-set-btn').addEventListener('click', () => {
        const val = parseFloat(document.getElementById('cap-input').value);
        if (isNaN(val) || val < 0) {
            announce('Enter a valid positive number for the cap.', 'alert');
            return;
        }
        setCapTarget(val);
        renderAll();
        announce(`Spending cap set to ${formatCurrency(val)}`, 'status');
    });

    // M6 placeholders (stubs)
    document.getElementById('export-json-btn').addEventListener('click', () => announce('Export will be added in M6', 'status'));
    document.getElementById('settings-export-btn').addEventListener('click', () => announce('Export will be added in M6', 'status'));
    document.getElementById('import-json-btn').addEventListener('click', () => announce('Import will be added in M6', 'status'));
    document.getElementById('settings-import-btn').addEventListener('click', () => announce('Import will be added in M6', 'status'));
    document.getElementById('seed-btn').addEventListener('click', () => announce('Seed will be added in M6', 'status'));
    document.getElementById('clear-btn').addEventListener('click', () => announce('Clear will be added in M6', 'status'));
    document.getElementById('add-category-btn').addEventListener('click', () => announce('Categories will be added in M6', 'status'));

    document.querySelectorAll('#currency-base, #currency-alt1, #currency-alt2, #rate-base-alt1, #rate-base-alt2, #display-currency')
        .forEach(el => {
            el.addEventListener('change', () => announce('Currency settings will be added in M6', 'status'));
        });

    // ---------- CHANGE: escape key handler ----------
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && editingId) {
            cancelEdit();
            navigateTo('records');
            announce('Edit cancelled.', 'status');
        }
    });

    // ---------- CHANGE: use event delegation with a different approach ----------
    document.getElementById('records-body').addEventListener('click', (e) => {
        const btn = e.target.closest('.edit-btn, .delete-btn');
        if (!btn) return;
        const id = btn.dataset.id;
        if (btn.classList.contains('edit-btn')) startEdit(id);
        else if (btn.classList.contains('delete-btn')) deleteRecordHandler(id);
    });

    announce('Student Ledger ready.', 'status');
}

// ---------- CHANGE: rename handleFormSubmit → processForm ----------
function handleFormSubmit(e) {
    e.preventDefault();
    clearFieldErrors();

    const desc = document.getElementById('form-description').value.trim();
    const amountStr = document.getElementById('form-amount').value.trim();
    const category = document.getElementById('form-category').value;
    const date = document.getElementById('form-date').value;

    let valid = true;

    if (!validators.description(desc)) {
        showFieldError('desc-error', 'Description must not have leading/trailing spaces and must be ≤ 60 chars.');
        valid = false;
    }
    if (desc.length > 0 && !validators.complex(desc)) {
        const successEl = document.getElementById('desc-success');
        if (successEl) {
            successEl.textContent = '💡 Tip: include a number, letter, and special char for extra security.';
            successEl.classList.add('visible');
        }
    }

    if (!validators.amount(amountStr) || parseFloat(amountStr) === 0) {
        showFieldError('amount-error', 'Enter a positive amount (e.g. 12.50).');
        valid = false;
    }

    if (!validators.date(date)) {
        showFieldError('date-error', 'Enter a valid date in YYYY-MM-DD format.');
        valid = false;
    }

    if (!validators.category(category)) {
        showFieldError('cat-error', 'Category must contain only letters, spaces, or hyphens.');
        valid = false;
    }

    if (!valid) {
        announce('Please fix the errors in the form.', 'alert');
        return;
    }

    const amount = parseFloat(amountStr);
    const isEdit = !!editingId;

    if (isEdit) {
        updateRecord(editingId, { description: desc, amount, category, date, updatedAt: nowISO() });
        announce('Transaction updated successfully.', 'status');
    } else {
        const newRecord = {
            id: generateId(),
            description: desc,
            amount,
            category,
            date,
            createdAt: nowISO(),
            updatedAt: nowISO()
        };
        addRecord(newRecord);
        announce('Transaction added successfully.', 'status');
    }

    cancelEdit();
    renderAll();
}

// ---------- CHANGE: rename startEdit → beginEdit ----------
function startEdit(id) {
    const r = findRecord(id);
    if (!r) return;
    editingId = id;
    setEditingId(id);
    document.getElementById('edit-id').value = id;
    document.getElementById('form-description').value = r.description;
    document.getElementById('form-amount').value = Math.abs(r.amount).toFixed(2);
    document.getElementById('form-category').value = r.category || 'Other';
    document.getElementById('form-date').value = r.date;
    document.getElementById('add-heading').textContent = 'Edit Transaction';
    document.getElementById('form-submit-btn').textContent = 'Update Transaction';
    document.getElementById('form-cancel-btn').style.display = 'inline-flex';
    navigateTo('add');
}

// ---------- CHANGE: rename cancelEdit → abortEdit ----------
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

// ---------- CHANGE: rename deleteRecordHandler → removeRecord ----------
function deleteRecordHandler(id) {
    const r = findRecord(id);
    if (!r) return;
    if (!confirm(`Delete "${r.description}" (${formatCurrency(r.amount)})?`)) return;
    deleteRecord(id);
    renderAll();
    announce('Transaction deleted.', 'status');
}

// ---------- CHANGE: rename clearFieldErrors → hideErrors ----------
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

// Start app
document.addEventListener('DOMContentLoaded', init);