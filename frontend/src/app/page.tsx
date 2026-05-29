"use client";

import { useState } from "react";
import NdaForm from "@/components/NdaForm";
import NdaPreview from "@/components/NdaPreview";
import DownloadButton from "@/components/DownloadButton";
import { defaultNdaData, type NdaData } from "@/lib/nda";

export default function Home() {
  const [data, setData] = useState<NdaData>(defaultNdaData);

  return (
    <main className="relative z-10 mx-auto max-w-[1340px] px-5 pb-20 pt-10 sm:px-8">
      {/* Masthead */}
      <header className="rise mb-10 flex flex-col gap-5 border-b-2 border-ink pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2 text-oxblood">Prelegal</p>
          <h1 className="font-display text-4xl leading-[1.05] text-ink sm:text-5xl">
            Mutual NDA,
            <br />
            <span className="italic text-oxblood">drafted in minutes.</span>
          </h1>
          <p className="mt-3 max-w-md text-sm italic text-muted">
            Enter a handful of details on the left. Watch the agreement compose
            itself on the right. Download a clean, ready-to-sign PDF.
          </p>
        </div>
        <DownloadButton data={data} />
      </header>

      {/* Workbench: form + live preview */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
        {/* Form */}
        <div className="rise" style={{ animationDelay: "80ms" }}>
          <div className="lg:sticky lg:top-8">
            <NdaForm data={data} setData={setData} />
          </div>
        </div>

        {/* Preview */}
        <div className="rise" style={{ animationDelay: "160ms" }}>
          <div className="mb-3 flex items-center justify-between">
            <span className="eyebrow text-muted">Live Preview</span>
            <span className="text-xs italic text-faint">
              Updates as you type
            </span>
          </div>
          <div className="thin-scroll max-h-[calc(100vh-9rem)] overflow-y-auto rounded-sm bg-surface px-7 py-8 shadow-paper ring-1 ring-rule lg:px-10 lg:py-12">
            <NdaPreview data={data} />
          </div>
        </div>
      </div>
    </main>
  );
}
