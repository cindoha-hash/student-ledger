// M4/M5 Rendering

import { fetchRecords, fetchCurrentSort, fetchSearchRegex, fetchCapTarget, fetchCurrencySettings } from './state.js';
import { highlightText } from './search.js';

const currencySymbols = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$' };

function convertCurrency(amount, from, to, settings) {
    const base = settings.base;
    let rateToBase = 1;
    if (from === base) rateToBase = 1;
    else if (from === settings.alt1) rateToBase = 1 / settings.rateAlt1;
    else if (from === settings.alt2) rateToBase = 1 / settings.rateAlt2;
    else rateToBase = 1;
    const amountInBase = amount * rateToBase;
    let rateFromBase = 1;
    if (to === base) rateFromBase = 1;
    else if (to === settings.alt1) rateFromBase = settings.rateAlt1;
    else if (to === settings.alt2) rateFromBase = settings.rateAlt2;
    else rateFromBase = 1;
    return amountInBase * rateFromBase;
}

function getDisplayCurrencyCode(settings) {
    const disp = settings.display;
    if (disp === 'alt1') return settings.alt1;
    if (disp === 'alt2') return settings.alt2;
    return settings.base;
}

function formatCurrency(amount, settings) {
    const targetCode = getDisplayCurrencyCode(settings);
    const symbol = currencySymbols[targetCode] || '$';
    const converted = convertCurrency(amount, settings.base, targetCode, settings);
    const sign = converted < 0 ? '-' : '';
    return sign + symbol + Math.abs(converted).toFixed(2);
}

export function buildDashboard() {
    const records = fetchRecords();
    const settings = fetchCurrencySettings();
    const capTarget = fetchCapTarget();

    const total = records.length;
    const totalIncome = records.filter(r => r.amount > 0).reduce((s, r) => s + r.amount, 0);
    const totalExpenses = records.filter(r => r.amount < 0).reduce((s, r) => s + Math.abs(r.amount), 0);
    const balance = totalIncome - totalExpenses;

    const catMap = {};
    records.forEach(r => {
        if (r.amount < 0) {
            const cat = r.category || 'Other';
            catMap[cat] = (catMap[cat] || 0) + Math.abs(r.amount);
        }
    });
    let topCat = '—';
    let topVal = 0;
    for (const [k, v] of Object.entries(catMap)) {
        if (v > topVal) { topVal = v; topCat = k; }
    }

    document.getElementById('balance-display').textContent = formatCurrency(balance, settings);
    document.getElementById('dash-income').textContent = formatCurrency(totalIncome, settings);
    document.getElementById('dash-expenses').textContent = formatCurrency(totalExpenses, settings);
    document.getElementById('stat-count').textContent = total;
    document.getElementById('stat-income').textContent = formatCurrency(totalIncome, settings);
    document.getElementById('stat-expenses').textContent = formatCurrency(totalExpenses, settings);
    document.getElementById('stat-top-category').textContent = topCat;

    const convDiv = document.getElementById('currency-conversion');
    const baseSym = currencySymbols[settings.base] || '$';
    const alt1Sym = currencySymbols[settings.alt1] || '€';
    const alt2Sym = currencySymbols[settings.alt2] || '£';
    const alt1Amount = convertCurrency(balance, settings.base, settings.alt1, settings);
    const alt2Amount = convertCurrency(balance, settings.base, settings.alt2, settings);
    convDiv.innerHTML = `
        <span>${baseSym}${balance.toFixed(2)} ${settings.base}</span>
        <span>${alt1Sym}${alt1Amount.toFixed(2)} ${settings.alt1}</span>
        <span>${alt2Sym}${alt2Amount.toFixed(2)} ${settings.alt2}</span>
    `;

    const capStatus = document.getElementById('cap-status');
    const remaining = capTarget - totalExpenses;
    if (remaining >= 0) {
        capStatus.textContent = `Remaining: ${formatCurrency(remaining, settings)}`;
        capStatus.style.color = 'var(--color-sage)';
    } else {
        capStatus.textContent = `Over budget by: ${formatCurrency(Math.abs(remaining), settings)}`;
        capStatus.style.color = 'var(--color-error)';
    }

    drawTrendChart(records, settings);
}

function drawTrendChart(records, settings) {
    const chart = document.getElementById('trend-chart');
    const now = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const total = records
            .filter(r => r.date === key && r.amount < 0)
            .reduce((s, r) => s + Math.abs(r.amount), 0);
        days.push({ date: key, total });
    }
    const max = Math.max(...days.map(d => d.total), 1);
    chart.innerHTML = days.map(d => {
        const pct = (d.total / max) * 100;
        const label = d.date.slice(5);
        return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;height:100%;justify-content:flex-end;">
            <div style="width:100%;max-width:32px;background:var(--color-amber);border-radius:2px 2px 0 0;height:${pct}%;min-height:4px;transition:height 0.3s ease;" aria-label="${label}: ${formatCurrency(d.total, settings)}"></div>
            <span style="font-size:0.6rem;color:var(--color-text-muted);">${label}</span>
        </div>`;
    }).join('');
    chart.setAttribute('aria-label', `Bar chart of daily spending for the last 7 days. ${days.map(d => `${d.date.slice(5)}: ${formatCurrency(d.total, settings)}`).join(', ')}`);
}

export function buildTable() {
    const records = fetchRecords();
    const sort = fetchCurrentSort();
    const searchRegex = fetchSearchRegex();
    const settings = fetchCurrencySettings();
    const tbody = document.getElementById('records-body');
    let filtered = [...records];

    if (searchRegex) {
        filtered = filtered.filter(r =>
            searchRegex.test(r.description) ||
            searchRegex.test(r.category) ||
            searchRegex.test(r.date)
        );
    }

    filtered.sort((a, b) => {
        let va = a[sort.field] ?? '';
        let vb = b[sort.field] ?? '';
        if (sort.field === 'amount') {
            va = parseFloat(va) || 0;
            vb = parseFloat(vb) || 0;
        } else if (sort.field === 'date') {
            // keep as string
        } else {
            va = String(va).toLowerCase();
            vb = String(vb).toLowerCase();
        }
        if (va < vb) return sort.direction === 'asc' ? -1 : 1;
        if (va > vb) return sort.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const count = filtered.length;
    document.getElementById('search-stats').textContent = `${count} record${count !== 1 ? 's' : ''}`;

    if (count === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="table-empty">${records.length === 0 ? 'No records yet. Add your first transaction!' : 'No records match your search.'}</td></tr>`;
        return;
    }

    const re = searchRegex;
    tbody.innerHTML = filtered.map(r => {
        const descHtml = re ? highlightText(r.description, re) : r.description;
        const catHtml = re ? highlightText(r.category, re) : r.category;
        const dateHtml = re ? highlightText(r.date, re) : r.date;
        const amt = parseFloat(r.amount) || 0;
        const amtClass = amt >= 0 ? 'income' : 'expense';
        const amtStr = formatCurrency(amt, settings);
        return `<tr>
            <td>${dateHtml}</td>
            <td>${descHtml}</td>
            <td>${catHtml}</td>
            <td style="text-align:right;font-family:var(--font-mono);color:var(--color-${amtClass});">${amtStr}</td>
            <td style="text-align:right;">
                <div class="record-actions" style="justify-content:flex-end;">
                    <button class="btn btn-primary btn-sm edit-btn" data-id="${r.id}" aria-label="Edit ${r.description}">✎</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${r.id}" aria-label="Delete ${r.description}">✕</button>
                </div>
            </td>
        </tr>`;
    }).join('');

    document.querySelectorAll('th[data-sort]').forEach(th => {
        const field = th.dataset.sort;
        const icon = th.querySelector('.sort-icon');
        if (field === sort.field) {
            th.setAttribute('aria-sort', sort.direction === 'asc' ? 'ascending' : 'descending');
            icon.textContent = sort.direction === 'asc' ? '▲' : '▼';
        } else {
            th.setAttribute('aria-sort', 'none');
            icon.textContent = '⇅';
        }
    });
}

export function refreshUI() {
    buildDashboard();
    buildTable();
    const count = fetchRecords().length;
    document.getElementById('settings-record-count').textContent = count;
    document.getElementById('cap-input').value = fetchCapTarget();
    const settings = fetchCurrencySettings();
    document.getElementById('currency-base').value = settings.base;
    document.getElementById('currency-alt1').value = settings.alt1;
    document.getElementById('currency-alt2').value = settings.alt2;
    document.getElementById('rate-base-alt1').value = settings.rateAlt1;
    document.getElementById('rate-base-alt2').value = settings.rateAlt2;
    document.getElementById('display-currency').value = settings.display;
}

export function goToPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + pageId);
    if (target) target.classList.add('active');
    document.querySelectorAll('.app-nav button').forEach(btn => {
        btn.removeAttribute('aria-current');
        if (btn.dataset.page === pageId) {
            btn.setAttribute('aria-current', 'page');
        }
    });
}

export function sayStatus(msg, type = 'status') {
    const el = document.getElementById(type === 'alert' ? 'live-alert' : 'live-status');
    if (el) {
        el.textContent = msg;
        setTimeout(() => { el.textContent = ''; }, 4000);
    }
}