import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RowActions } from "./row-actions";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@/components/ui", () => require("@/test-utils/ui-mock"));

describe("RowActions", () => {
  it("renders the open button when mutation is not allowed", () => {
    render(
      <RowActions canMutate={false} onOpen={jest.fn()}>
        <span>child</span>
      </RowActions>,
    );
    expect(screen.getByRole("button", { name: "open" })).toBeInTheDocument();
    expect(screen.queryByText("child")).not.toBeInTheDocument();
  });

  it("renders children when mutation is allowed", () => {
    render(
      <RowActions canMutate={true} onOpen={jest.fn()}>
        <span>child</span>
      </RowActions>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("invokes onOpen when the open button is clicked", async () => {
    const user = userEvent.setup();
    const onOpen = jest.fn();
    render(
      <RowActions canMutate={false} onOpen={onOpen}>
        <span>child</span>
      </RowActions>,
    );
    await user.click(screen.getByRole("button", { name: "open" }));
    expect(onOpen).toHaveBeenCalled();
  });

  it("stops propagation on the container click", async () => {
    const user = userEvent.setup();
    const onContainerClick = jest.fn();
    render(
      <div onClick={onContainerClick}>
        <RowActions canMutate={false} onOpen={jest.fn()}>
          <span>child</span>
        </RowActions>
      </div>,
    );
    await user.click(screen.getByRole("button", { name: "open" }));
    expect(onContainerClick).not.toHaveBeenCalled();
  });
});
