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

### Example Record Schema
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
```

---

## UI Layout Wireframes

```text
## STUDENT-LEDGER-DASHBOARD-- WIREFRAMES 
┌──────────────────────────────────────────────┐
│  Student Ledger             [Dash][Rec][Add] │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐  │
│  │  $3,540.60                             │  │
│  │  ▲ Income $4,200          ▼ Exp $1,560 │  │
│  └────────────────────────────────────────┘  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │
│  │ Totals │ │ Income │ │Expense │ │  Top   │ │
│  │   12   │ │ $4,200 │ │ $1,560 │ │  Food  │ │
│  └────────┘ └────────┘ └────────┘ └────────┘ │
│  Cap: [2000] [Set]           Remaining $2,640 │
│  Trend: [■■■■] [■■] [■■■■■] ...              │
└──────────────────────────────────────────────┘

## STUDENT-LEDGER-RECORDS-- WIREFRAMES 
┌──────────────────────────────────────────────┐
│  Search: [ /coffee|tea/i ]           12 recs │
│  Try: /coffee|tea/i  /\.\d{2}\b/             │
│  ┌────────────────────────────────────────┐  │
│  │ Date       │ Description   │ Cat │ Amt │  │
│  ├────────────┼───────────────┼─────┼─────┤  │
│  │ 2025-09-25 │ Lunch at caf. │Food │-12.5│  │
│  │ 2025-09-23 │ Chem textbook │Books│-89.9│  │
│  └────────────────────────────────────────┘  │
│  [Export] [Import] [Seed] [Clear]            │
└──────────────────────────────────────────────┘

## STUDENT-LEDGER-FORMS-- WIREFRAMES 
┌──────────────────────────────────────────────┐
│  Add Transaction                             │
│                                              │
│  Description: [___________________________]  │
│  Amount:      [___________________________]  │
│  Category:    [Food                     ▼]  │
│  Date:        [2025-09-29                 ]  │
│                                              │
│  [Add]  [Cancel]                             │
└──────────────────────────────────────────────┘

## STUDENT-LEDGER-SETTINGS-- WIREFRAMES 
┌──────────────────────────────────────────────┐
│  Settings                                    │
│  ┌──────────────────┐ ┌──────────────────┐   │
│  │ Currency         │ │ Categories       │   │
│  │ Base: USD        │ │  Food            │   │
│  │ Alt1: EUR        │ │  Books           │   │
│  │ Alt2: GBP        │ │  [+ Add]         │   │
│  └──────────────────┘ └──────────────────┘   │
│  ┌──────────────────┐                        │
│  │ Data             │                        │
│  │ Records: 12      │                        │
│  │ [Export]         │                        │
│  └──────────────────┘                        │
└──────────────────────────────────────────────┘
```

---

## Accessibility (a11y) Plan

*   **Semantic HTML**: Utilizes `<header>`, `<nav>`, `<main>`, `<section>`, and `<footer>` layout tags.
*   **Heading Hierarchy**: Structured clean navigation using `<h1>`, `<h2>`, and `<h3>` tags with no skipped levels.
*   **Skip Link**: A skip-to-content helper visible on keyboard focus that directly jumps viewports to `#main-content`.
*   **ARIA Live Regions**: Built using `role="status"` (polite delivery) for standard confirmations and `role="alert"` (assertive delivery) for form errors.
*   **Form Labels**: Every interactive entry field maps cleanly to a dedicated `<label>` tracking an explicit `for` property attribute match.
*   **Error Messaging**: Connects layout input boxes dynamically to secondary feedback containers using `aria-describedby`.
*   **Focus Styles**: Standardized interactive indicators styled around a clear `:focus-visible` pseudoclass with a 3px amber outline rule.
*   **Color Contrast**: Combines deep navy (`#11141C`) backgrounds with amber (`#F2B84B`), sage (`#7BAF8A`), and terracotta (`#D4836A`) functional indicators ensuring full WCAG AA standard compliance.
*   **Color + Icon Rules**: Income or expense direction signals deploy explicit symbols alongside standard dynamic color accents (`▲`/`▼`) so navigation never hinges purely on color parsing.
*   **Search Highlights**: Utilizes the custom semantic `<mark>` styling mechanism providing maximum contrast properties.
*   **Keyboard Navigation**: Built so users can fluidly jump between interactive points utilizing `Tab` loops, trigger events via `Enter`/`Space`, and terminate forms or processes by tapping `Escape`.

---

## Regex Validation Rules

| Rule Name | Target Pattern | Engineering Purpose |
| :--- | :--- | :--- |
| **Description** | `/^\S(?:.*\S)?\$/` | Trims white spaces and rejects double spacing entry faults. |
| **Amount** | `/^(0\|[1-9]\d*)(\.\d{1,2})?\$/` | Evaluates positive numerical limits mapping down to two clean decimals. |
| **Date** | `/^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])\$/` | Matches traditional standardized `YYYY-MM-DD` structured dates. |
| **Category** | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*\$/` | Caps entry targets to clean strings containing letters, standard spaces, or hyphens. |
| **Advanced** | `/(?=.*\d)(?=.*[a-zA-Z])(?=.*[^\w\s])/` | A clean variable lookahead verifying at least one numerical digit, character string letter, and symbol string modifier exists. |

### Future Search Pattern Targets:
*   `/coffee|tea/i` – Tracks down any specific instances matching coffee or tea variations.
*   `/\.\d{2}\b/` – Filters transaction strings displaying exact cents details.
*   `/\b(\w+)\s+\1\b/` – Automatically flags double word typos inside your application descriptions.

---

## Keyboard Navigation Map

| Key / Combination | Target Action |
| :--- | :--- |
| **Tab / Shift + Tab** | Jumps highlight selections back and forth across page interactive nodes. |
| **Enter** | Fires focused operations or processes form validation execution loops. |
| **Space** | Toggles interactive choices or activates selected element states. |
| **Escape** | Closes down open data processing windows or reverts modification edits. |

## Deployment

**Live URL:** [https://cindoha-hash.github.io/student-ledger](https://cindoha-hash.github.io/student-ledger)

**VIDEO Live Url** [https://youtu.be/LDaBhv3bVg8](https://youtu.be/LDaBhv3bVg8)