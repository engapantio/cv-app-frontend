import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OpenLanguageOverlay } from "./open-language-overlay";
import type { LanguageItem } from "../types";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/components/ui", () => require("@/test-utils/ui-mock"));

const target: LanguageItem = {
  id: "3",
  created_at: "2024-01-01T00:00:00Z",
  name: "Spanish",
  native_name: "Español",
  iso2: "es",
} as LanguageItem;

describe("OpenLanguageOverlay", () => {
  it("renders nothing when no target is set", () => {
    render(<OpenLanguageOverlay target={null} onClose={jest.fn()} />);
    expect(screen.queryByTestId("dialog-content")).not.toBeInTheDocument();
  });

  it("shows the language fields and close button", () => {
    render(<OpenLanguageOverlay target={target} onClose={jest.fn()} />);
    expect(screen.getByText("Spanish")).toBeInTheDocument();
    expect(screen.getByText("Español")).toBeInTheDocument();
    expect(screen.getByText("es")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "close" })).toBeInTheDocument();
  });

  it("falls back to an em dash for a missing native name", () => {
    render(<OpenLanguageOverlay target={{ ...target, native_name: null }} onClose={jest.fn()} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<OpenLanguageOverlay target={target} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "close" }));
    expect(onClose).toHaveBeenCalled();
  });
});
