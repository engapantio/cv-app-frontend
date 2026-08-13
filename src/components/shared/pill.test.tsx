import { render, screen } from "@testing-library/react";
import { Pill } from "./pill";

describe("Pill", () => {
  it("renders the text with the muted variant by default", () => {
    render(<Pill text="React" />);
    const pill = screen.getByText("React");
    expect(pill).toHaveAttribute("title", "React");
    expect(pill.className).toContain("bg-muted");
  });

  it("renders the responsibility variant", () => {
    render(<Pill text="Lead" variant="responsibility" />);
    const pill = screen.getByText("Lead");
    expect(pill.className).toContain("bg-responsibility");
    expect(pill.className).toContain("text-[13px]");
  });

  it("renders the transparent variant", () => {
    render(<Pill text="HR" variant="transparent" />);
    const pill = screen.getByText("HR");
    expect(pill.className).toContain("bg-transparent");
    expect(pill.className).toContain("border-table-border");
  });
});
