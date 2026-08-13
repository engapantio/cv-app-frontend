import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OpenDepartmentOverlay } from "./open-department-overlay";
import type { DepartmentItem } from "../types";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/components/ui", () => require("@/test-utils/ui-mock"));

const target: DepartmentItem = {
  id: "7",
  created_at: "2024-01-01T00:00:00Z",
  name: "Engineering",
} as DepartmentItem;

describe("OpenDepartmentOverlay", () => {
  it("renders nothing when no target is set", () => {
    render(<OpenDepartmentOverlay target={null} onClose={jest.fn()} />);
    expect(screen.queryByTestId("dialog-content")).not.toBeInTheDocument();
  });

  it("shows the department name and close button", () => {
    render(<OpenDepartmentOverlay target={target} onClose={jest.fn()} />);
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "close" })).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<OpenDepartmentOverlay target={target} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "close" }));
    expect(onClose).toHaveBeenCalled();
  });
});
