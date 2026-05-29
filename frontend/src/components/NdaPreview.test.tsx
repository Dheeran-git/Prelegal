import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import NdaPreview from "./NdaPreview";
import { defaultNdaData, type NdaData } from "@/lib/nda";

function makeData(overrides: Partial<NdaData> = {}): NdaData {
  return {
    ...defaultNdaData,
    ...overrides,
    party1: { ...defaultNdaData.party1, ...(overrides.party1 ?? {}) },
    party2: { ...defaultNdaData.party2, ...(overrides.party2 ?? {}) },
  };
}

describe("NdaPreview", () => {
  it("renders the document title and section headings", () => {
    render(<NdaPreview data={defaultNdaData} />);
    expect(
      screen.getByRole("heading", { name: /Mutual Non-Disclosure Agreement/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Cover Page")).toBeInTheDocument();
    expect(screen.getByText("Signatures")).toBeInTheDocument();
    expect(screen.getByText("Standard Terms")).toBeInTheDocument();
  });

  it("renders all 11 standard-term clauses", () => {
    const { container } = render(<NdaPreview data={defaultNdaData} />);
    const items = container.querySelectorAll("ol > li");
    expect(items).toHaveLength(11);
  });

  it("shows placeholders for empty fields", () => {
    render(<NdaPreview data={defaultNdaData} />);
    expect(screen.getByText("[State]")).toBeInTheDocument();
    expect(screen.getByText("[City or County, State]")).toBeInTheDocument();
    expect(screen.getByText("[Effective Date]")).toBeInTheDocument();
  });

  it("renders filled-in values", () => {
    render(
      <NdaPreview
        data={makeData({
          effectiveDate: "2026-05-30",
          governingLaw: "Delaware",
          jurisdiction: "New Castle, Delaware",
          party1: { company: "Acme, Inc." },
          party2: { company: "Globex LLC" },
        })}
      />,
    );
    expect(screen.getByText("May 30, 2026")).toBeInTheDocument();
    expect(screen.getByText("Delaware")).toBeInTheDocument();
    expect(screen.getByText("Acme, Inc.")).toBeInTheDocument();
    expect(screen.getByText("Globex LLC")).toBeInTheDocument();
    expect(screen.queryByText("[State]")).not.toBeInTheDocument();
  });

  it("reflects the perpetual confidentiality option", () => {
    render(<NdaPreview data={makeData({ confidentialityType: "perpetual" })} />);
    expect(screen.getByText("In perpetuity.")).toBeInTheDocument();
  });

  it("reflects the until-terminated MNDA term option", () => {
    render(<NdaPreview data={makeData({ mndaTermType: "untilTerminated" })} />);
    expect(
      screen.getByText(/Continues until terminated/i),
    ).toBeInTheDocument();
  });

  it("renders signature blocks with Print Name and Date rows for both parties", () => {
    render(<NdaPreview data={defaultNdaData} />);
    expect(screen.getAllByText("Print Name")).toHaveLength(2);
    expect(screen.getAllByText("Date")).toHaveLength(2);
  });

  it("shows 'None.' for modifications by default and the value when set", () => {
    const { rerender } = render(<NdaPreview data={defaultNdaData} />);
    expect(screen.getByText("MNDA Modifications")).toBeInTheDocument();
    expect(screen.getByText("None.")).toBeInTheDocument();
    rerender(
      <NdaPreview data={makeData({ modifications: "Section 8 removed." })} />,
    );
    expect(screen.getByText("Section 8 removed.")).toBeInTheDocument();
  });

  it("includes the CC BY 4.0 attribution", () => {
    const { container } = render(<NdaPreview data={defaultNdaData} />);
    expect(within(container).getByText(/CC BY 4\.0/i)).toBeInTheDocument();
  });
});
