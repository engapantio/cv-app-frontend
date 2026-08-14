import { render, screen } from "@testing-library/react";
import { VerifiedBadge } from "./verified-badge";

describe("VerifiedBadge", () => {
  it("renders nothing when not verified", () => {
    const { container } = render(<VerifiedBadge verified={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when verified is undefined", () => {
    const { container } = render(<VerifiedBadge />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a badge with the verified label when verified", () => {
    render(<VerifiedBadge verified={true} />);
    expect(screen.getByLabelText("Verified")).toBeInTheDocument();
  });

  it("applies the mask image style", () => {
    render(<VerifiedBadge verified={true} />);
    const badge = screen.getByLabelText("Verified");
    expect(badge.style.maskImage).toContain("data:image/svg+xml");
  });
});
