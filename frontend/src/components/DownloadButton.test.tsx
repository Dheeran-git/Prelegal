import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DownloadButton from "./DownloadButton";
import { defaultNdaData } from "@/lib/nda";

// Stub the heavy PDF machinery so the test exercises the download *wiring*
// (blob URL + anchor click) without a real browser PDF renderer.
vi.mock("@react-pdf/renderer", () => ({
  pdf: () => ({
    toBlob: async () => new Blob(["%PDF-1.4"], { type: "application/pdf" }),
  }),
}));
vi.mock("@/lib/ndaPdf", () => ({ NdaPdfDocument: () => null }));

describe("DownloadButton", () => {
  beforeEach(() => {
    // jsdom implements neither of these.
    URL.createObjectURL = vi.fn(() => "blob:mock");
    URL.revokeObjectURL = vi.fn();
  });

  it("renders an enabled idle button", () => {
    render(<DownloadButton data={defaultNdaData} />);
    expect(
      screen.getByRole("button", { name: /Download PDF/i }),
    ).toBeEnabled();
  });

  it("generates a PDF and triggers a download on click", async () => {
    const user = userEvent.setup();
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    render(<DownloadButton data={defaultNdaData} />);
    await user.click(screen.getByRole("button", { name: /Download PDF/i }));

    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock");

    clickSpy.mockRestore();
  });

  it("shows an error message if PDF generation fails", async () => {
    const user = userEvent.setup();
    URL.createObjectURL = vi.fn(() => {
      throw new Error("boom");
    });
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(<DownloadButton data={defaultNdaData} />);
    await user.click(screen.getByRole("button", { name: /Download PDF/i }));

    expect(
      await screen.findByText(/Something went wrong generating the PDF/i),
    ).toBeInTheDocument();
  });
});
