"use client";

import { Dispatch, ReactNode, SetStateAction } from "react";
import type { NdaData, PartyInfo } from "@/lib/nda";

interface NdaFormProps {
  data: NdaData;
  setData: Dispatch<SetStateAction<NdaData>>;
}

export default function NdaForm({ data, setData }: NdaFormProps) {
  const set = <K extends keyof NdaData>(key: K, value: NdaData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const setParty = (
    which: "party1" | "party2",
    key: keyof PartyInfo,
    value: string,
  ) => setData((prev) => ({ ...prev, [which]: { ...prev[which], [key]: value } }));

  return (
    <form className="space-y-9" onSubmit={(e) => e.preventDefault()}>
      <Section
        index="01"
        title="The Basics"
        caption="What the agreement is for and when it starts."
      >
        <Field label="Purpose" hint="How Confidential Information may be used.">
          <textarea
            className="field-input"
            rows={3}
            value={data.purpose}
            onChange={(e) => set("purpose", e.target.value)}
            placeholder="Evaluating a potential business relationship…"
          />
        </Field>

        <Field label="Effective Date">
          <input
            type="date"
            className="field-input"
            value={data.effectiveDate}
            onChange={(e) => set("effectiveDate", e.target.value)}
          />
        </Field>
      </Section>

      <Section
        index="02"
        title="Duration"
        caption="How long the agreement and the confidentiality obligations last."
      >
        <Field label="MNDA Term" hint="The length of this MNDA.">
          <div className="space-y-2">
            <Radio
              name="mndaTerm"
              checked={data.mndaTermType === "fixed"}
              onChange={() => set("mndaTermType", "fixed")}
            >
              <span className="inline-flex flex-wrap items-baseline gap-1.5">
                Expires
                <YearInput
                  value={data.mndaTermYears}
                  disabled={data.mndaTermType !== "fixed"}
                  onChange={(n) => set("mndaTermYears", n)}
                />
                from the Effective Date
              </span>
            </Radio>
            <Radio
              name="mndaTerm"
              checked={data.mndaTermType === "untilTerminated"}
              onChange={() => set("mndaTermType", "untilTerminated")}
            >
              Continues until terminated
            </Radio>
          </div>
        </Field>

        <Field
          label="Term of Confidentiality"
          hint="How long Confidential Information is protected."
        >
          <div className="space-y-2">
            <Radio
              name="confidentiality"
              checked={data.confidentialityType === "fixed"}
              onChange={() => set("confidentialityType", "fixed")}
            >
              <span className="inline-flex flex-wrap items-baseline gap-1.5">
                <YearInput
                  value={data.confidentialityYears}
                  disabled={data.confidentialityType !== "fixed"}
                  onChange={(n) => set("confidentialityYears", n)}
                />
                from the Effective Date
              </span>
            </Radio>
            <Radio
              name="confidentiality"
              checked={data.confidentialityType === "perpetual"}
              onChange={() => set("confidentialityType", "perpetual")}
            >
              In perpetuity
            </Radio>
          </div>
        </Field>
      </Section>

      <Section
        index="03"
        title="Governing Law"
        caption="Which laws apply and where disputes are heard."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Governing Law" hint="State">
            <input
              className="field-input"
              value={data.governingLaw}
              onChange={(e) => set("governingLaw", e.target.value)}
              placeholder="Delaware"
            />
          </Field>
          <Field label="Jurisdiction" hint="City or county, state">
            <input
              className="field-input"
              value={data.jurisdiction}
              onChange={(e) => set("jurisdiction", e.target.value)}
              placeholder="New Castle, Delaware"
            />
          </Field>
        </div>
      </Section>

      <Section
        index="04"
        title="The Parties"
        caption="The two companies entering into the agreement."
      >
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
          <PartyFields
            heading="Party 1"
            party={data.party1}
            onChange={(key, value) => setParty("party1", key, value)}
          />
          <PartyFields
            heading="Party 2"
            party={data.party2}
            onChange={(key, value) => setParty("party2", key, value)}
          />
        </div>
      </Section>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Building blocks                                                      */
/* ------------------------------------------------------------------ */

function Section({
  index,
  title,
  caption,
  children,
}: {
  index: string;
  title: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-baseline gap-3 border-b border-rule pb-2">
        <span className="font-display text-sm text-oxblood">{index}</span>
        <h3 className="font-display text-xl text-ink">{title}</h3>
        <span className="ml-auto hidden text-right text-xs italic text-muted sm:block">
          {caption}
        </span>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between">
        <span className="eyebrow">{label}</span>
        {hint ? <span className="text-xs italic text-faint">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

function PartyFields({
  heading,
  party,
  onChange,
}: {
  heading: string;
  party: PartyInfo;
  onChange: (key: keyof PartyInfo, value: string) => void;
}) {
  return (
    <fieldset className="space-y-3 rounded-sm border border-rule bg-white/40 p-4">
      <legend className="px-1 font-display text-base text-ink">{heading}</legend>
      <Field label="Company">
        <input
          className="field-input"
          value={party.company}
          onChange={(e) => onChange("company", e.target.value)}
          placeholder="Acme, Inc."
        />
      </Field>
      <Field label="Signatory Name">
        <input
          className="field-input"
          value={party.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="Jordan Rivera"
        />
      </Field>
      <Field label="Title">
        <input
          className="field-input"
          value={party.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="Chief Executive Officer"
        />
      </Field>
      <Field label="Notice Address" hint="Email or postal">
        <input
          className="field-input"
          value={party.noticeAddress}
          onChange={(e) => onChange("noticeAddress", e.target.value)}
          placeholder="legal@acme.com"
        />
      </Field>
    </fieldset>
  );
}

function Radio({
  name,
  checked,
  onChange,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-2.5 text-sm leading-relaxed ${
        checked ? "text-ink" : "text-muted"
      }`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-1 h-3.5 w-3.5 accent-oxblood"
      />
      <span>{children}</span>
    </label>
  );
}

function YearInput({
  value,
  disabled,
  onChange,
}: {
  value: number;
  disabled: boolean;
  onChange: (n: number) => void;
}) {
  return (
    <input
      type="number"
      min={1}
      max={99}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))}
      className="w-14 rounded-sm border border-rule bg-white/70 px-1.5 py-0.5 text-center text-sm tabular-nums disabled:opacity-40"
      aria-label="Number of years"
    />
  );
}
