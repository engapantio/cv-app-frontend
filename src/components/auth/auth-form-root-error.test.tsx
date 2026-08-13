import { render, screen } from "@testing-library/react";
import { AuthFormRootError } from "./auth-form-root-error";

describe("AuthFormRootError", () => {
  it("renders nothing when no message is provided", () => {
    const { container } = render(<AuthFormRootError />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the message when provided", () => {
    render(<AuthFormRootError message="Authentication failed" />);
    expect(screen.getByText("Authentication failed")).toBeInTheDocument();
  });
});
