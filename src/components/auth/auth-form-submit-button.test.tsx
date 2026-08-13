import { render, screen } from "@testing-library/react";
import { AuthFormSubmitButton } from "./auth-form-submit-button";

jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@/components/ui/button", () => require("@/test-utils/ui-mock"));

describe("AuthFormSubmitButton", () => {
  it("renders the children when not loading", () => {
    render(<AuthFormSubmitButton>Sign in</AuthFormSubmitButton>);
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
  });

  it("renders the loading text and disables the button while loading", () => {
    render(
      <AuthFormSubmitButton loading loadingText="Signing in">
        Sign in
      </AuthFormSubmitButton>,
    );
    const button = screen.getByRole("button", { name: "Signing in" });
    expect(button).toBeDisabled();
    expect(screen.queryByText("Sign in")).not.toBeInTheDocument();
  });
});
