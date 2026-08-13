import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OpenSkillOverlay } from "./open-skill-overlay";
import type { SkillItem } from "../types";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/components/ui", () => require("@/test-utils/ui-mock"));

const target: SkillItem = {
  id: "5",
  created_at: "2024-01-01T00:00:00Z",
  name: "React",
  category_name: "Frontend",
  category_parent_name: "Development",
  category: {
    id: "c1",
    name: "Frontend",
    order: 1,
    parent: { id: "c0", name: "Development", order: 0 },
  },
} as SkillItem;

describe("OpenSkillOverlay", () => {
  it("renders nothing when no target is set", () => {
    render(<OpenSkillOverlay target={null} onClose={jest.fn()} />);
    expect(screen.queryByTestId("dialog-content")).not.toBeInTheDocument();
  });

  it("shows the skill fields and close button", () => {
    render(<OpenSkillOverlay target={target} onClose={jest.fn()} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Development")).toBeInTheDocument();
    expect(screen.getByText("Frontend")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "close" })).toBeInTheDocument();
  });

  it("falls back to em dashes for missing category names", () => {
    render(
      <OpenSkillOverlay
        target={{ ...target, category_parent_name: null, category_name: null }}
        onClose={jest.fn()}
      />,
    );
    expect(screen.getAllByText("—")).toHaveLength(2);
  });

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<OpenSkillOverlay target={target} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "close" }));
    expect(onClose).toHaveBeenCalled();
  });
});
