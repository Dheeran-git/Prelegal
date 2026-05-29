/**
 * Shared data model and content for the Mutual NDA.
 *
 * This module is intentionally framework-agnostic (no JSX) so the exact same
 * data drives both the on-screen preview (`NdaPreview`) and the downloadable
 * PDF (`ndaPdf.tsx`). The legal text is the Common Paper Mutual NDA Standard
 * Terms v1.0, free to use under CC BY 4.0.
 */

export type MndaTermType = "fixed" | "untilTerminated";
export type ConfidentialityType = "fixed" | "perpetual";

export interface PartyInfo {
  company: string;
  name: string;
  title: string;
  /** Either an email or a postal address. */
  noticeAddress: string;
}

export interface NdaData {
  purpose: string;
  /** ISO date string (yyyy-mm-dd) or "" when unset. */
  effectiveDate: string;
  mndaTermType: MndaTermType;
  mndaTermYears: number;
  confidentialityType: ConfidentialityType;
  confidentialityYears: number;
  /** Governing law — a US state. */
  governingLaw: string;
  /** Jurisdiction — city/county and state. */
  jurisdiction: string;
  /** Free-text modifications to the Standard Terms (optional). */
  modifications: string;
  party1: PartyInfo;
  party2: PartyInfo;
}

const emptyParty: PartyInfo = {
  company: "",
  name: "",
  title: "",
  noticeAddress: "",
};

export const defaultNdaData: NdaData = {
  purpose:
    "Evaluating whether to enter into a business relationship with the other party.",
  effectiveDate: "",
  mndaTermType: "fixed",
  mndaTermYears: 1,
  confidentialityType: "fixed",
  confidentialityYears: 1,
  governingLaw: "",
  jurisdiction: "",
  modifications: "",
  party1: { ...emptyParty },
  party2: { ...emptyParty },
};

/** Bracketed placeholders shown when a field is left blank. */
export const PLACEHOLDER = {
  purpose: "[How Confidential Information may be used]",
  effectiveDate: "[Effective Date]",
  governingLaw: "[State]",
  jurisdiction: "[City or County, State]",
} as const;

export const MIN_YEARS = 1;
export const MAX_YEARS = 99;

/** Coerces a year count to an integer within [MIN_YEARS, MAX_YEARS]. */
export function clampYears(n: number): number {
  const floored = Math.floor(n);
  if (!Number.isFinite(floored) || floored < MIN_YEARS) return MIN_YEARS;
  return Math.min(MAX_YEARS, floored);
}

/** Returns the trimmed value, or `placeholder` when the value is empty. */
export function valueOr(value: string, placeholder: string): string {
  const v = value.trim();
  return v.length > 0 ? v : placeholder;
}

/** Pluralise "year" based on a count. */
function years(n: number): string {
  return `${n} ${n === 1 ? "year" : "years"}`;
}

/** Human-readable effective date, or a placeholder when unset. */
export function formatEffectiveDate(iso: string): string {
  if (!iso) return PLACEHOLDER.effectiveDate;
  // Parse as a local date to avoid timezone shifting the calendar day.
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return PLACEHOLDER.effectiveDate;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** The "MNDA Term" sentence shown on the cover page. */
export function mndaTermText(data: NdaData): string {
  return data.mndaTermType === "fixed"
    ? `Expires ${years(data.mndaTermYears)} from the Effective Date.`
    : "Continues until terminated in accordance with the terms of this MNDA.";
}

/** The "Term of Confidentiality" sentence shown on the cover page. */
export function confidentialityTermText(data: NdaData): string {
  return data.confidentialityType === "fixed"
    ? `${years(
        data.confidentialityYears,
      )} from the Effective Date, but in the case of trade secrets until the Confidential Information is no longer considered a trade secret under applicable law.`
    : "In perpetuity.";
}

export interface Clause {
  title: string;
  body: string;
}

/**
 * The static Common Paper Mutual NDA Standard Terms (Version 1.0).
 *
 * Clauses 1–8 and 10–11 are pure boilerplate and are defined once at module
 * scope so they are not re-allocated on every render. Clause 9 (Governing Law
 * and Jurisdiction) is the only clause that interpolates user data and is built
 * per-call by `getStandardTerms`.
 */
const CLAUSES_1_TO_8: readonly Clause[] = [
  {
    title: "Introduction",
    body: "This Mutual Non-Disclosure Agreement (which incorporates these Standard Terms and the Cover Page (defined below)) (“MNDA”) allows each party (“Disclosing Party”) to disclose or make available information in connection with the Purpose which (1) the Disclosing Party identifies to the receiving party (“Receiving Party”) as “confidential”, “proprietary”, or the like or (2) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure (“Confidential Information”). Each party’s Confidential Information also includes the existence and status of the parties’ discussions and information on the Cover Page. Confidential Information includes technical or business information, product designs or roadmaps, requirements, pricing, security and compliance documentation, technology, inventions and know-how. To use this MNDA, the parties must complete and sign a cover page incorporating these Standard Terms (“Cover Page”). Each party is identified on the Cover Page and capitalized terms have the meanings given herein or on the Cover Page.",
  },
  {
    title: "Use and Protection of Confidential Information",
    body: "The Receiving Party shall: (a) use Confidential Information solely for the Purpose; (b) not disclose Confidential Information to third parties without the Disclosing Party’s prior written approval, except that the Receiving Party may disclose Confidential Information to its employees, agents, advisors, contractors and other representatives having a reasonable need to know for the Purpose, provided these representatives are bound by confidentiality obligations no less protective of the Disclosing Party than the applicable terms in this MNDA and the Receiving Party remains responsible for their compliance with this MNDA; and (c) protect Confidential Information using at least the same protections the Receiving Party uses for its own similar information but no less than a reasonable standard of care.",
  },
  {
    title: "Exceptions",
    body: "The Receiving Party’s obligations in this MNDA do not apply to information that it can demonstrate: (a) is or becomes publicly available through no fault of the Receiving Party; (b) it rightfully knew or possessed prior to receipt from the Disclosing Party without confidentiality restrictions; (c) it rightfully obtained from a third party without confidentiality restrictions; or (d) it independently developed without using or referencing the Confidential Information.",
  },
  {
    title: "Disclosures Required by Law",
    body: "The Receiving Party may disclose Confidential Information to the extent required by law, regulation or regulatory authority, subpoena or court order, provided (to the extent legally permitted) it provides the Disclosing Party reasonable advance notice of the required disclosure and reasonably cooperates, at the Disclosing Party’s expense, with the Disclosing Party’s efforts to obtain confidential treatment for the Confidential Information.",
  },
  {
    title: "Term and Termination",
    body: "This MNDA commences on the Effective Date and expires at the end of the MNDA Term. Either party may terminate this MNDA for any or no reason upon written notice to the other party. The Receiving Party’s obligations relating to Confidential Information will survive for the Term of Confidentiality, despite any expiration or termination of this MNDA.",
  },
  {
    title: "Return or Destruction of Confidential Information",
    body: "Upon expiration or termination of this MNDA or upon the Disclosing Party’s earlier request, the Receiving Party will: (a) cease using Confidential Information; (b) promptly after the Disclosing Party’s written request, destroy all Confidential Information in the Receiving Party’s possession or control or return it to the Disclosing Party; and (c) if requested by the Disclosing Party, confirm its compliance with these obligations in writing. As an exception to subsection (b), the Receiving Party may retain Confidential Information in accordance with its standard backup or record retention policies or as required by law, but the terms of this MNDA will continue to apply to the retained Confidential Information.",
  },
  {
    title: "Proprietary Rights",
    body: "The Disclosing Party retains all of its intellectual property and other rights in its Confidential Information and its disclosure to the Receiving Party grants no license under such rights.",
  },
  {
    title: "Disclaimer",
    body: "ALL CONFIDENTIAL INFORMATION IS PROVIDED “AS IS”, WITH ALL FAULTS, AND WITHOUT WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.",
  },
];

const CLAUSES_10_TO_11: readonly Clause[] = [
  {
    title: "Equitable Relief",
    body: "A breach of this MNDA may cause irreparable harm for which monetary damages are an insufficient remedy. Upon a breach of this MNDA, the Disclosing Party is entitled to seek appropriate equitable relief, including an injunction, in addition to its other remedies.",
  },
  {
    title: "General",
    body: "Neither party has an obligation under this MNDA to disclose Confidential Information to the other or proceed with any proposed transaction. Neither party may assign this MNDA without the prior written consent of the other party, except that either party may assign this MNDA in connection with a merger, reorganization, acquisition or other transfer of all or substantially all its assets or voting securities. Any assignment in violation of this Section is null and void. This MNDA will bind and inure to the benefit of each party’s permitted successors and assigns. Waivers must be signed by the waiving party’s authorized representative and cannot be implied from conduct. If any provision of this MNDA is held unenforceable, it will be limited to the minimum extent necessary so the rest of this MNDA remains in effect. This MNDA (including the Cover Page) constitutes the entire agreement of the parties with respect to its subject matter, and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, whether written or oral, regarding such subject matter. This MNDA may only be amended, modified, waived, or supplemented by an agreement in writing signed by both parties. Notices, requests and approvals under this MNDA must be sent in writing to the email or postal addresses on the Cover Page and are deemed delivered on receipt. This MNDA may be executed in counterparts, including electronic copies, each of which is deemed an original and which together form the same agreement.",
  },
];

/**
 * Returns all 11 Standard Terms clauses in order, with clause 9 interpolated
 * with the user's governing law and jurisdiction (or placeholders).
 */
export function getStandardTerms(data: NdaData): Clause[] {
  const law = valueOr(data.governingLaw, PLACEHOLDER.governingLaw);
  const jurisdiction = valueOr(data.jurisdiction, PLACEHOLDER.jurisdiction);

  const governingLawClause: Clause = {
    title: "Governing Law and Jurisdiction",
    body: `This MNDA and all matters relating hereto are governed by, and construed in accordance with, the laws of the State of ${law}, without regard to the conflict of laws provisions of such state. Any legal suit, action, or proceeding relating to this MNDA must be instituted in the federal or state courts located in ${jurisdiction}. Each party irrevocably submits to the exclusive jurisdiction of such courts in any such suit, action, or proceeding.`,
  };

  return [...CLAUSES_1_TO_8, governingLawClause, ...CLAUSES_10_TO_11];
}

/**
 * The rows of a party's signature block, in the Common Paper Cover Page order.
 * Rows without a `field` (Signature, Date) render as blank lines to be filled
 * in by hand. Shared so the preview and the PDF can never diverge.
 */
export interface SignatureRow {
  caption: string;
  field?: keyof PartyInfo;
}

export const SIGNATURE_ROWS: readonly SignatureRow[] = [
  { caption: "Signature" },
  { caption: "Print Name", field: "name" },
  { caption: "Title", field: "title" },
  { caption: "Company", field: "company" },
  { caption: "Notice Address", field: "noticeAddress" },
  { caption: "Date" },
];

export const MODIFICATIONS_NOTE =
  "Any modifications listed on this Cover Page control over conflicting Standard Terms.";

export const ATTRIBUTION =
  "Based on the Common Paper Mutual Non-Disclosure Agreement (Version 1.0), free to use under CC BY 4.0.";

/**
 * Builds a filesystem-friendly download filename for the agreement, e.g.
 * `Mutual-NDA-Acme-Inc-and-Globex-LLC.pdf`. Falls back to `Mutual-NDA.pdf`
 * when neither party has a company name. Unicode letters/digits are preserved.
 */
export function buildNdaFilename(data: NdaData): string {
  const slug = (s: string) =>
    s
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-")
      .slice(0, 40)
      .replace(/^-+|-+$/g, "");

  const parties = [slug(data.party1.company), slug(data.party2.company)]
    .filter(Boolean)
    .join("-and-");

  return parties ? `Mutual-NDA-${parties}.pdf` : "Mutual-NDA.pdf";
}
