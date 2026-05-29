"use client";

import {
  ATTRIBUTION,
  confidentialityTermText,
  formatEffectiveDate,
  getStandardTerms,
  mndaTermText,
  valueOr,
  type NdaData,
  type PartyInfo,
} from "@/lib/nda";

export default function NdaPreview({ data }: { data: NdaData }) {
  const terms = getStandardTerms(data);

  return (
    <article className="document">
      <header className="mb-6 text-center">
        <p className="eyebrow mb-2 text-faint">Common Paper · Version 1.0</p>
        <h1 className="font-display text-[1.7rem] leading-tight text-ink">
          Mutual Non-Disclosure Agreement
        </h1>
        <div className="mx-auto mt-3 h-px w-16 bg-oxblood" />
      </header>

      {/* Cover page */}
      <section className="mb-7">
        <SectionLabel>Cover Page</SectionLabel>

        <DefRow term="Purpose">
          {valueOr(data.purpose, "[How Confidential Information may be used]")}
        </DefRow>
        <DefRow term="Effective Date">
          {formatEffectiveDate(data.effectiveDate)}
        </DefRow>
        <DefRow term="MNDA Term">{mndaTermText(data)}</DefRow>
        <DefRow term="Term of Confidentiality">
          {confidentialityTermText(data)}
        </DefRow>
        <DefRow term="Governing Law">
          {valueOr(data.governingLaw, "[State]")}
        </DefRow>
        <DefRow term="Jurisdiction">
          {valueOr(data.jurisdiction, "[City or County, State]")}
        </DefRow>
      </section>

      {/* Signatures */}
      <section className="mb-8">
        <SectionLabel>Signatures</SectionLabel>
        <p className="!text-left text-xs italic text-muted">
          By signing this Cover Page, each party agrees to enter into this MNDA
          as of the Effective Date.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-5">
          <SignatureBlock label="Party 1" party={data.party1} />
          <SignatureBlock label="Party 2" party={data.party2} />
        </div>
      </section>

      {/* Standard terms */}
      <section>
        <SectionLabel>Standard Terms</SectionLabel>
        <ol className="space-y-3">
          {terms.map((clause, i) => (
            <li key={clause.title} className="flex gap-2">
              <span className="font-display text-xs text-oxblood">{i + 1}.</span>
              <p className="!mb-0">
                <span className="font-semibold">{clause.title}.</span>{" "}
                {clause.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="mt-7 border-t border-rule pt-3 text-center text-[0.7rem] italic text-faint">
        {ATTRIBUTION}
      </footer>
    </article>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="eyebrow mb-3 flex items-center gap-3 text-oxblood">
      {children}
      <span className="h-px flex-1 bg-rule" />
    </h2>
  );
}

function DefRow({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2.5 grid grid-cols-[8.5rem_1fr] gap-3 border-b border-rule pb-2.5">
      <span className="font-semibold text-ink">{term}</span>
      <span className="text-muted">{children}</span>
    </div>
  );
}

function SignatureBlock({
  label,
  party,
}: {
  label: string;
  party: PartyInfo;
}) {
  return (
    <div className="text-xs">
      <p className="eyebrow !mb-2 !text-left text-faint">{label}</p>
      <SignatureLine value={party.company} caption="Company" />
      <SignatureLine value="" caption="Signature" />
      <SignatureLine value={party.name} caption="Print Name" />
      <SignatureLine value={party.title} caption="Title" />
      <SignatureLine value={party.noticeAddress} caption="Notice Address" />
    </div>
  );
}

function SignatureLine({
  value,
  caption,
}: {
  value: string;
  caption: string;
}) {
  return (
    <div className="mb-2.5">
      <div className="flex min-h-[1.1rem] items-end border-b border-muted pb-0.5 text-ink">
        {value}
      </div>
      <span className="text-[0.62rem] uppercase tracking-wider text-faint">
        {caption}
      </span>
    </div>
  );
}
