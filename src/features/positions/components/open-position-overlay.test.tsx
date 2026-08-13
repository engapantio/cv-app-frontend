import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OpenPositionOverlay } from "./open-position-overlay";
import type { PositionItem } from "../types";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/components/ui", () => require("@/test-utils/ui-mock"));

const target: PositionItem = {
  id: "4",
  created_at: "2024-01-01T00:00:00Z",
  name: "Backend Developer",
} as PositionItem;

describe("OpenPositionOverlay", () => {
  it("renders nothing when no target is set", () => {
    render(<OpenPositionOverlay target={null} onClose={jest.fn()} />);
    expect(screen.queryByTestId("dialog-content")).not.toBeInTheDocument();
  });

  it("shows the position name and close button", () => {
    render(<OpenPositionOverlay target={target} onClose={jest.fn()} />);
    expect(screen.getByText("Backend Developer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "close" })).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<OpenPositionOverlay target={target} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "close" }));
    expect(onClose).toHaveBeenCalled();
  });
});
