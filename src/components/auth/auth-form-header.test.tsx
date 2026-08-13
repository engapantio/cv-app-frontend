import { render, screen } from "@testing-library/react";
import { AuthFormHeader } from "./auth-form-header";

describe("AuthFormHeader", () => {
  it("renders the title and subtitle", () => {
    render(<AuthFormHeader title="Welcome" subtitle="Sign in to continue" />);
    expect(screen.getByRole("heading", { name: "Welcome" })).toBeInTheDocument();
    expect(screen.getByText("Sign in to continue")).toBeInTheDocument();
  });
});
