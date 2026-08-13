import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordField } from "./password-field";

jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@/components/ui/input", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/ui/button", () => require("@/test-utils/ui-mock"));

describe("PasswordField", () => {
  it("renders a password input and toggles visibility", async () => {
    const user = userEvent.setup();
    render(<PasswordField aria-label="Password" />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("forwards extra input props and disabled state", () => {
    render(<PasswordField aria-label="Password" value="secret" readOnly disabled />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveValue("secret");
    expect(input).toBeDisabled();
    expect(screen.getByRole("button", { name: "Show password" })).toBeDisabled();
  });
});
