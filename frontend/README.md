# Prelegal — Mutual NDA Creator (frontend)

A Next.js prototype that drafts a **Mutual Non-Disclosure Agreement** from a few
key details ([PL-3](https://dheeran.atlassian.net/browse/PL-3)).

1. Fill in the key information (purpose, dates, term, governing law, parties).
2. See the agreement render live, with your details filled in.
3. Download a clean, ready-to-sign **PDF**.

The legal text is the [Common Paper Mutual NDA Standard Terms v1.0](https://commonpaper.com/standards/mutual-nda/1.0),
free to use under CC BY 4.0 (curated into the repo's top-level `templates/`).

## Stack

- [Next.js](https://nextjs.org) 14 (App Router) + React 18 + TypeScript
- [Tailwind CSS](https://tailwindcss.com) for styling
- [@react-pdf/renderer](https://react-pdf.org) for client-side PDF generation
- Fonts: Fraunces (display) + Spectral (body), via `next/font`

## Getting started

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the dev server                 |
| `npm run build` | Production build                     |
| `npm run start` | Serve the production build           |
| `npm run lint`  | Lint                                 |

## Structure

```
src/
  app/
    layout.tsx        Root layout + fonts
    page.tsx          State + form/preview layout
    globals.css       Editorial "ink on paper" theme
  components/
    NdaForm.tsx       The input form
    NdaPreview.tsx    Live on-screen document
    DownloadButton.tsx Client-side PDF download
  lib/
    nda.ts            Shared data model + Standard Terms text
    ndaPdf.tsx        PDF document (react-pdf)
```

The on-screen preview and the PDF are driven by the **same** data model
(`lib/nda.ts`), so they never drift apart.
