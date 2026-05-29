# Testing — Mutual NDA Creator

## Automated tests (Vitest)

```bash
cd frontend
npm install
npm run test         # run once
npm run test:watch   # watch mode
```

The suite (47 tests) covers:

| Area | File | What it checks |
| --- | --- | --- |
| Pure logic | `src/lib/nda.test.ts` | defaults, `valueOr`, date formatting (incl. timezone safety), term/confidentiality sentences (singular/plural, both variants), the 11 standard-term clauses + governing-law interpolation, `buildNdaFilename` (slugging, truncation, fallbacks), attribution |
| Live preview | `src/components/NdaPreview.test.tsx` | title/sections render, all 11 clauses, placeholders vs filled values, perpetual / until-terminated variants, attribution |
| Form | `src/components/NdaForm.test.tsx` | section headings, controlled inputs update, party independence, year inputs enable/disable with radios, empty-year coercion to 1 |
| Download | `src/components/DownloadButton.test.tsx` | idle render, click generates a blob + triggers download (mocked react-pdf), error state on failure |

Also run the production build, which type-checks and lints:

```bash
npm run build
```

---

## Manual test plan

Run `npm run dev` and open http://localhost:3000. The automated suite does **not**
render a real PDF (that needs a browser), so the PDF checks below are the
important manual ones.

### 1. First load
- [ ] Page loads with masthead, form (left), and live "paper" preview (right).
- [ ] Preview already shows the document with the default Purpose and `[State]`,
      `[City or County, State]`, `[Effective Date]` placeholders.
- [ ] No console errors.

### 2. The Basics
- [ ] Editing **Purpose** updates the Purpose line in the preview live.
- [ ] Picking an **Effective Date** shows it formatted (e.g. "May 30, 2026")
      in the cover page — and the displayed day matches the day you picked
      (no off-by-one).

### 3. Duration
- [ ] **MNDA Term** → "Expires N years…": changing N updates the preview;
      "year" vs "years" pluralizes correctly (try N = 1 and N = 2).
- [ ] Selecting **"Continues until terminated"** disables the year box and the
      preview switches to that wording.
- [ ] **Term of Confidentiality** → same behavior; **"In perpetuity"** shows
      "In perpetuity." in the preview and disables its year box.

### 4. Governing Law
- [ ] Typing **Governing Law** and **Jurisdiction** updates both the cover page
      *and* clause 9 ("…laws of the State of X… courts located in Y…").
- [ ] Clearing them restores the `[State]` / `[City or County, State]` placeholders.

### 5. The Parties
- [ ] Company / Signatory / Title / Notice Address for **Party 1** and **Party 2**
      update their respective signature blocks in the preview.
- [ ] The two parties are independent (editing one doesn't change the other).

### 6. Download PDF  ← the key manual check
- [ ] Click **Download PDF**. Button shows "Preparing…" then a file downloads.
- [ ] Filename reflects the companies, e.g. `Mutual-NDA-Acme-Inc-and-Globex-LLC.pdf`
      (or `Mutual-NDA.pdf` when no companies are set).
- [ ] Open the PDF: title, cover page values, signature blocks, and all 11
      standard-term clauses are present and match the on-screen preview.
- [ ] PDF text is **selectable** (not an image).
- [ ] CC BY 4.0 attribution appears in the footer.

### 7. Edge cases
- [ ] Download with everything empty → valid PDF full of placeholders, named
      `Mutual-NDA.pdf`.
- [ ] Very long company names / punctuation (e.g. "A & B, Inc.") → filename is
      cleanly slugged and truncated; PDF still renders.
- [ ] Long Purpose text wraps correctly in both preview and PDF.

### 8. Responsive & accessibility (spot check)
- [ ] Narrow the window / mobile width: form and preview stack vertically and
      remain usable.
- [ ] Tab through the form: all inputs and radios are reachable by keyboard.
