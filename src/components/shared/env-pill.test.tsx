import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnvPill } from "./env-pill";

jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());

describe("EnvPill", () => {
  it("renders the environment name without a remove control", () => {
    render(<EnvPill env="Production" />);
    expect(screen.getByText("Production")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders a remove control when onRemove is provided", () => {
    render(<EnvPill env="Production" onRemove={jest.fn()} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls onRemove on click", async () => {
    const user = userEvent.setup();
    const onRemove = jest.fn();
    render(<EnvPill env="Production" onRemove={onRemove} />);
    await user.click(screen.getByRole("button"));
    expect(onRemove).toHaveBeenCalledWith("Production");
  });

  it("calls onRemove on Enter key", async () => {
    const user = userEvent.setup();
    const onRemove = jest.fn();
    render(<EnvPill env="Staging" onRemove={onRemove} />);
    await user.keyboard("{Enter}");
    await user.click(screen.getByRole("button"));
    expect(onRemove).toHaveBeenCalledWith("Staging");
  });

  it("stops propagation when removing", async () => {
    const user = userEvent.setup();
    const onContainerClick = jest.fn();
    const onRemove = jest.fn();
    render(
      <span onClick={onContainerClick}>
        <EnvPill env="Production" onRemove={onRemove} />
      </span>,
    );
    await user.click(screen.getByRole("button"));
    expect(onRemove).toHaveBeenCalled();
    expect(onContainerClick).not.toHaveBeenCalled();
  });
});
