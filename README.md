# Student Ledger – Finance Tracker

**Theme:** Student Finance Tracker  
**Built for:** Building Responsive UI summative assignment  

---

## Overview

Student Ledger is a personal finance management tool designed for students to track income, expenses, and budgets. It features a clean, accessible interface with a deep navy palette, warm amber accents, and a torn‑ledger‑edge motif. All data is stored locally in your browser.

---

## Features (Planned)

- **Dashboard** – real‑time balance, income/expense summary, top spending category, 7‑day trend chart, and a monthly spending cap with live alerts.
- **Records** – sortable transaction table with live regular‑expression search and highlighted matches.
- **Add / Edit** – validated form with 5 regex rules (including an advanced lookahead) and clear error feedback.
- **Settings** – base currency + 2 alternative currencies with manual exchange rates, editable category list, and JSON import/export.
- **Accessibility** – semantic landmarks, skip‑to‑content, ARIA live regions, visible focus, and full keyboard support.
- **Responsive** – mobile‑first with breakpoints at 360px, 768px, and 1024px.

---

## Data Model

Each transaction record is a plain JavaScript object with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier, e.g. `"txn_0001"` |
| `description` | string | ✅ | Transaction title (max 60 chars) |
| `amount` | number | ✅ | Positive or negative value (up to 2 decimals) |
| `category` | string | ✅ | One of: `Food`, `Books`, `Transport`, `Entertainment`, `Fees`, `Other` (editable) |
| `date` | string | ✅ | Date in `YYYY-MM-DD` format |
| `createdAt` | string | ✅ | ISO timestamp when the record was created |
| `updatedAt` | string | ✅ | ISO timestamp when the record was last updated |

**Example record:**
```json
{
  "id": "txn_0001",
  "description": "Lunch at cafeteria",
  "amount": -12.50,
  "category": "Food",
  "date": "2025-09-25",
  "createdAt": "2025-09-25T12:00:00.000Z",
  "updatedAt": "2025-09-25T12:00:00.000Z"
}

```text

## STUDENT-LEDGER-DASHBOARD-- WIREFRAMES 
┌──────────────────────────────────────┐
│  Student Ledger   [Dash][Rec][Add]  │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │  $3,540.60                    │  │
│  │  ▲ Income $4,200  ▼ Exp $1,560│  │
│  └────────────────────────────────┘  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌────┐  │
│  │ Totals│ │Income │ │Expense│ │Top │  │
│  │  12   │ │$4,200 │ │$1,560 │ │Food│  │
│  └──────┘ └──────┘ └──────┘ └────┘  │
│  Cap: [2000] [Set]  Remaining $2,640 │
│  Trend: [■■■■] [■■] [■■■■■] ...     │
└──────────────────────────────────────┘

## STUDENT-LEDGER-RECORDS-- WIREFRAMES 
┌──────────────────────────────────────┐
│  Search: [ /coffee|tea/i ]  12 recs │
│  Try: /coffee|tea/i  /\.\d{2}\b/    │
│  ┌─────────────────────────────────┐ │
│  │Date    │Description   │Cat  │Amt │ │
│  │2025-09-25│Lunch at cafeteria│Food│-$12.50│
│  │2025-09-23│Chemistry textbook│Books│-$89.99│
│  └─────────────────────────────────┘ │
│  [Export] [Import] [Seed] [Clear]    │
└──────────────────────────────────────┘
## STUDENT-LEDGER-FORMS-- WIREFRAMES 
┌──────────────────────────────────────┐
│  Add Transaction                     │
│  Description: [__________________]   │
│  Amount:      [_________]           │
│  Category:    [Food ▼]              │
│  Date:        [2025-09-29]          │
│  [Add]  [Cancel]                    │
└──────────────────────────────────────┘
## STUDENT-LEDGER-SETTINGS-- WIREFRAMES 
┌──────────────────────────────────────┐
│  Settings                            │
│  ┌────────────┐ ┌────────────┐      │
│  │  Currency   │ │ Categories │      │
│  │  Base: USD  │ │  Food      │      │
│  │  Alt1: EUR  │ │  Books     │      │
│  │  Alt2: GBP  │ │  [+ Add]   │      │
│  └────────────┘ └────────────┘      │
│  ┌────────────┐                     │
│  │  Data      │                     │
│  │  Records:12│                     │
│  │  [Export]  │                     │
│  └────────────┘                     │
└──────────────────────────────────────┘
```
```text

Accessibility (a11y) Plan
Semantic HTML: <header>, <nav>, <main>, <section>, <footer>.

Heading hierarchy: <h1>, <h2>, <h3> – no skipped levels.

Skip link: visible on focus, jumps to #main-content.

ARIA live regions: role="status" (polite) for confirmations, role="alert" (assertive) for errors.

Form labels: every input has a <label> with for attribute.

Error messaging: aria-describedby links inputs to hint/error containers.

Focus styles: :focus-visible with 3px amber outline.

Colour contrast: navy (#11141C) with amber (#F2B84B), sage (#7BAF8A), terracotta (#D4836A) – all pass WCAG AA.

Colour + icon: income/expense indicators use both colour and text labels (▲/▼) – never colour alone.

Search highlights: <mark> with sufficient contrast.

Keyboard navigation: all interactive elements reachable with Tab; Enter/Space activate; Escape cancels editing.

```text

Regex Validation Rules
Rule	Pattern	Purpose
Description	/^\S(?:.*\S)?$/	No leading/trailing spaces; collapse doubles.
Amount	/^(0|[1-9]\d*)(\.\d{1,2})?$/	Positive number with up to 2 decimals.
Date	/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/	Valid calendar date (YYYY-MM-DD).
Category	/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/	Letters, spaces, hyphens only.
Advanced (lookahead)	/(?=.*\d)(?=.*[a-zA-Z])(?=.*[^\w\s])/	At least one digit, one letter, one special character.
Search examples (to be implemented later):

/coffee|tea/i – find coffee or tea transactions.

/\.\d{2}\b/ – find amounts with cents.

/\b(\w+)\s+\1\b/ – find duplicate words in descriptions.

```

```text

##Keyboard Map

Key / Combination	Action
Tab / Shift+Tab	Navigate between interactive elements.
Enter	Activate focused button / submit form.
Space	Toggle / activate focused button.
Escape	Cancel editing (closes the edit form).

```

