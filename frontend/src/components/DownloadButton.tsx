"use client";

import { useState } from "react";
import type { NdaData } from "@/lib/nda";

function buildFilename(data: NdaData): string {
  const slug = (s: string) =>
    s
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 40);

  const a = slug(data.party1.company);
  const b = slug(data.party2.company);
  const parties = [a, b].filter(Boolean).join("-and-");
  return parties ? `Mutual-NDA-${parties}.pdf` : "Mutual-NDA.pdf";
}

export default function DownloadButton({ data }: { data: NdaData }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function handleDownload() {
    setBusy(true);
    setError(false);
    try {
      // Imported lazily so @react-pdf/renderer is only ever loaded in the
      // browser, never during server rendering.
      const [{ pdf }, { NdaPdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/lib/ndaPdf"),
      ]);

      const blob = await pdf(<NdaPdfDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = buildFilename(data);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-1 sm:items-end">
      <button
        type="button"
        onClick={handleDownload}
        disabled={busy}
        className="group inline-flex items-center justify-center gap-2 rounded-sm bg-ink px-5 py-2.5 text-sm font-medium tracking-wide text-parchment shadow-paper transition hover:bg-oxblood disabled:cursor-not-allowed disabled:opacity-60"
      >
        <DownloadGlyph spinning={busy} />
        {busy ? "Preparing…" : "Download PDF"}
      </button>
      {error ? (
        <span className="text-xs italic text-oxblood">
          Something went wrong generating the PDF. Please try again.
        </span>
      ) : null}
    </div>
  );
}

function DownloadGlyph({ spinning }: { spinning: boolean }) {
  if (spinning) {
    return (
      <svg
        className="h-4 w-4 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2"
          strokeOpacity="0.3"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg
      className="h-4 w-4 transition-transform group-hover:translate-y-0.5"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
