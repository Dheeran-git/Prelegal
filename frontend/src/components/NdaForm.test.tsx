import { afterEach, describe, it, expect } from "vitest";
import { useState } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NdaForm from "./NdaForm";
import { defaultNdaData, type NdaData } from "@/lib/nda";

// Guarantee a clean DOM between cases regardless of globals config.
afterEach(cleanup);

/** A stateful host so the controlled form can be exercised end-to-end. */
function Host() {
  const [data, setData] = useState<NdaData>(defaultNdaData);
  return <NdaForm data={data} setData={setData} />;
}

/** The <fieldset> for a given party, located via its legend text. */
function partyFieldset(label: string): HTMLElement {
  const legend = screen.getByText(label);
  const fieldset = legend.closest("fieldset");
  if (!fieldset) throw new Error(`No fieldset for ${label}`);
  return fieldset;
}

describe("NdaForm", () => {
  it("renders all four section headings", () => {
    render(<Host />);
    for (const name of ["The Basics", "Duration", "Governing Law", "The Parties"]) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }
  });

  it("pre-fills the default purpose", () => {
    render(<Host />);
    const purpose = screen.getByPlaceholderText(/Evaluating a potential/i);
    expect(purpose).toHaveValue(defaultNdaData.purpose);
  });

  it("updates the governing law as the user types", async () => {
    const user = userEvent.setup();
    render(<Host />);
    const input = screen.getByPlaceholderText("Delaware");
    await user.type(input, "California");
    expect(input).toHaveValue("California");
  });

  it("updates a party company name (scoped to Party 1)", async () => {
    const user = userEvent.setup();
    render(<Host />);
    const company = within(partyFieldset("Party 1")).getByPlaceholderText(
      "Acme, Inc.",
    );
    await user.type(company, "Initech");
    expect(company).toHaveValue("Initech");
  });

  it("keeps the two parties independent", async () => {
    const user = userEvent.setup();
    render(<Host />);
    const p1 = within(partyFieldset("Party 1")).getByPlaceholderText(
      "Acme, Inc.",
    );
    const p2 = within(partyFieldset("Party 2")).getByPlaceholderText(
      "Acme, Inc.",
    );
    await user.type(p1, "Initech");
    expect(p1).toHaveValue("Initech");
    expect(p2).toHaveValue("");
  });

  it("enables both year inputs by default", () => {
    render(<Host />);
    const years = screen.getAllByLabelText("Number of years");
    expect(years).toHaveLength(2);
    expect(years[0]).toBeEnabled(); // MNDA Term
    expect(years[1]).toBeEnabled(); // Term of Confidentiality
  });

  // Radio order: [0] MNDA fixed, [1] MNDA until-terminated,
  //              [2] confidentiality fixed, [3] confidentiality perpetual.
  it("has exactly four radio options", () => {
    render(<Host />);
    expect(screen.getAllByRole("radio")).toHaveLength(4);
  });

  it("disables the MNDA year input when 'until terminated' is chosen", async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getAllByRole("radio")[1]);
    expect(screen.getAllByLabelText("Number of years")[0]).toBeDisabled();
  });

  it("disables the confidentiality year input when 'in perpetuity' is chosen", async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getAllByRole("radio")[3]);
    expect(screen.getAllByLabelText("Number of years")[1]).toBeDisabled();
  });

  it("lets the user change the number of years", () => {
    render(<Host />);
    const mndaYears = screen.getAllByLabelText("Number of years")[0];
    // The input coerces empty -> 1, so set the value directly rather than
    // clear()-then-type (which would briefly empty and snap back to 1).
    fireEvent.change(mndaYears, { target: { value: "5" } });
    expect(mndaYears).toHaveValue(5);
  });

  it("coerces an emptied year field back to a minimum of 1", () => {
    render(<Host />);
    const mndaYears = screen.getAllByLabelText("Number of years")[0];
    fireEvent.change(mndaYears, { target: { value: "" } });
    expect(mndaYears).toHaveValue(1);
  });
});
