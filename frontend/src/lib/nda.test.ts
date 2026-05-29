import { describe, it, expect } from "vitest";
import {
  defaultNdaData,
  valueOr,
  formatEffectiveDate,
  mndaTermText,
  confidentialityTermText,
  getStandardTerms,
  buildNdaFilename,
  ATTRIBUTION,
  type NdaData,
  type PartyInfo,
} from "./nda";

function party(overrides: Partial<PartyInfo> = {}): PartyInfo {
  return { company: "", name: "", title: "", noticeAddress: "", ...overrides };
}

function makeData(overrides: Partial<NdaData> = {}): NdaData {
  return {
    ...defaultNdaData,
    ...overrides,
    party1: { ...defaultNdaData.party1, ...(overrides.party1 ?? {}) },
    party2: { ...defaultNdaData.party2, ...(overrides.party2 ?? {}) },
  };
}

describe("defaultNdaData", () => {
  it("has sensible defaults", () => {
    expect(defaultNdaData.purpose.length).toBeGreaterThan(0);
    expect(defaultNdaData.effectiveDate).toBe("");
    expect(defaultNdaData.mndaTermType).toBe("fixed");
    expect(defaultNdaData.mndaTermYears).toBe(1);
    expect(defaultNdaData.confidentialityType).toBe("fixed");
    expect(defaultNdaData.confidentialityYears).toBe(1);
  });

  it("gives each party an independent object", () => {
    expect(defaultNdaData.party1).not.toBe(defaultNdaData.party2);
    const copy = makeData({ party1: { company: "Acme" } });
    // Mutating a derived copy must not leak into the shared default.
    expect(defaultNdaData.party1.company).toBe("");
    expect(copy.party2.company).toBe("");
  });
});

describe("valueOr", () => {
  it("returns the value when present", () => {
    expect(valueOr("Delaware", "[State]")).toBe("Delaware");
  });

  it("trims surrounding whitespace", () => {
    expect(valueOr("  Acme  ", "x")).toBe("Acme");
  });

  it("returns the placeholder when empty or whitespace-only", () => {
    expect(valueOr("", "[State]")).toBe("[State]");
    expect(valueOr("   ", "[State]")).toBe("[State]");
  });
});

describe("formatEffectiveDate", () => {
  it("returns a placeholder when unset", () => {
    expect(formatEffectiveDate("")).toBe("[Effective Date]");
  });

  it("formats a valid ISO date as a long US date", () => {
    expect(formatEffectiveDate("2026-05-30")).toBe("May 30, 2026");
  });

  it("does not shift the calendar day across timezones", () => {
    // A naive `new Date('2026-01-01')` parses as UTC midnight and can render
    // as Dec 31 in negative-offset zones. We parse as a local date instead.
    expect(formatEffectiveDate("2026-01-01")).toBe("January 1, 2026");
  });

  it("returns a placeholder for non-numeric junk", () => {
    expect(formatEffectiveDate("not-a-date")).toBe("[Effective Date]");
  });
});

describe("mndaTermText", () => {
  it("uses singular 'year' for 1", () => {
    expect(mndaTermText(makeData({ mndaTermType: "fixed", mndaTermYears: 1 }))).toBe(
      "Expires 1 year from the Effective Date.",
    );
  });

  it("uses plural 'years' for >1", () => {
    expect(mndaTermText(makeData({ mndaTermType: "fixed", mndaTermYears: 3 }))).toBe(
      "Expires 3 years from the Effective Date.",
    );
  });

  it("renders the until-terminated variant", () => {
    expect(mndaTermText(makeData({ mndaTermType: "untilTerminated" }))).toBe(
      "Continues until terminated in accordance with the terms of this MNDA.",
    );
  });
});

describe("confidentialityTermText", () => {
  it("renders a fixed term with the trade-secret carve-out", () => {
    const text = confidentialityTermText(
      makeData({ confidentialityType: "fixed", confidentialityYears: 1 }),
    );
    expect(text).toContain("1 year from the Effective Date");
    expect(text).toContain("trade secret");
  });

  it("pluralizes years", () => {
    const text = confidentialityTermText(
      makeData({ confidentialityType: "fixed", confidentialityYears: 5 }),
    );
    expect(text.startsWith("5 years from the Effective Date")).toBe(true);
  });

  it("renders the perpetual variant", () => {
    expect(
      confidentialityTermText(makeData({ confidentialityType: "perpetual" })),
    ).toBe("In perpetuity.");
  });
});

describe("getStandardTerms", () => {
  it("returns all 11 clauses in order", () => {
    const terms = getStandardTerms(defaultNdaData);
    expect(terms).toHaveLength(11);
    expect(terms[0].title).toBe("Introduction");
    expect(terms[7].title).toBe("Disclaimer");
    expect(terms[8].title).toBe("Governing Law and Jurisdiction");
    expect(terms[10].title).toBe("General");
  });

  it("gives every clause a non-empty body", () => {
    for (const clause of getStandardTerms(defaultNdaData)) {
      expect(clause.body.trim().length).toBeGreaterThan(0);
    }
  });

  it("uses placeholders in the governing-law clause when unset", () => {
    const governing = getStandardTerms(defaultNdaData)[8].body;
    expect(governing).toContain("[State]");
    expect(governing).toContain("[City or County, State]");
  });

  it("interpolates governing law and jurisdiction when provided", () => {
    const governing = getStandardTerms(
      makeData({ governingLaw: "Delaware", jurisdiction: "New Castle, Delaware" }),
    )[8].body;
    expect(governing).toContain("the laws of the State of Delaware");
    expect(governing).toContain("courts located in New Castle, Delaware");
    expect(governing).not.toContain("[State]");
    expect(governing).not.toContain("[City or County, State]");
  });
});

describe("buildNdaFilename", () => {
  it("falls back when no company names are set", () => {
    expect(buildNdaFilename(defaultNdaData)).toBe("Mutual-NDA.pdf");
  });

  it("uses a single party when only one company is set", () => {
    expect(
      buildNdaFilename(makeData({ party1: { company: "Acme, Inc." } })),
    ).toBe("Mutual-NDA-Acme-Inc.pdf");
  });

  it("joins both parties with -and-", () => {
    expect(
      buildNdaFilename(
        makeData({
          party1: { company: "Acme Inc" },
          party2: { company: "Globex LLC" },
        }),
      ),
    ).toBe("Mutual-NDA-Acme-Inc-and-Globex-LLC.pdf");
  });

  it("strips punctuation and collapses whitespace", () => {
    expect(
      buildNdaFilename(makeData({ party1: { company: "  A & B / C.,  Co  " } })),
    ).toBe("Mutual-NDA-A-B-C-Co.pdf");
  });

  it("truncates very long company names", () => {
    const long = "x".repeat(100);
    const name = buildNdaFilename(makeData({ party1: { company: long } }));
    // "x" repeated, sliced to 40 chars inside the slug.
    expect(name).toBe(`Mutual-NDA-${"x".repeat(40)}.pdf`);
  });

  it("never throws on unusual input", () => {
    expect(() =>
      buildNdaFilename(makeData({ party1: { company: "Café—Ñoño 株式会社" } })),
    ).not.toThrow();
  });
});

describe("ATTRIBUTION", () => {
  it("credits Common Paper under CC BY 4.0", () => {
    expect(ATTRIBUTION).toContain("Common Paper");
    expect(ATTRIBUTION).toContain("CC BY 4.0");
  });
});
