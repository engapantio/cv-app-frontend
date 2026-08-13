import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthField } from "./auth-field";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@/components/ui/input", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/button", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/shared/floating-field", () => ({
  FloatingField: ({
    label,
    error,
    children,
  }: {
    label: string;
    error?: string;
    children: React.ReactNode;
  }) => (
    <div>
      <span>{label}</span>
      {error && <p>{error}</p>}
      {children}
    </div>
  ),
}));

describe("AuthField", () => {
  it("renders a text input by default", () => {
    const { container } = render(<AuthField id="email" label="Email" />);
    const input = container.querySelector("#email") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
  });

  it("renders a password input and toggles visibility", async () => {
    const user = userEvent.setup();
    const { container } = render(<AuthField id="password" label="Password" type="password" />);
    const input = container.querySelector("#password") as HTMLInputElement;
    expect(input).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "show" }));
    expect(input).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: "hide" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("shows the error message when provided", () => {
    render(<AuthField id="email" label="Email" error="Invalid email" />);
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });

  it("forwards extra input props", () => {
    const { container } = render(<AuthField id="email" label="Email" value="a@b.com" readOnly />);
    expect(container.querySelector("#email")).toHaveValue("a@b.com");
  });
});
