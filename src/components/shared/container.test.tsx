import { render, screen } from "@testing-library/react";
import { Container } from "./container";

describe("Container", () => {
  it("renders children with default padding and max width", () => {
    const { container } = render(<Container>content</Container>);
    expect(screen.getByText("content")).toBeInTheDocument();
    expect(container.firstChild).toHaveStyle({ maxWidth: "1440px" });
    expect(container.firstChild).toHaveClass("px-4");
  });

  it("honours a custom max width", () => {
    const { container } = render(<Container maxWidth="900px">content</Container>);
    expect(container.firstChild).toHaveStyle({ maxWidth: "900px" });
  });

  it("skips padding when disabled", () => {
    const { container } = render(<Container padding={false}>content</Container>);
    expect(container.firstChild).not.toHaveClass("px-4");
  });

  it("merges a custom className", () => {
    const { container } = render(<Container className="extra">content</Container>);
    expect(container.firstChild).toHaveClass("extra");
  });
});
