import { render, screen } from "@testing-library/react";
import { UserProfileTabs } from "./user-profile-tabs";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

const mockPathname = jest.fn(() => "/users/u1/skills");

describe("UserProfileTabs", () => {
  it("renders all four tab links with the correct hrefs", () => {
    render(<UserProfileTabs userId="u1" />);
    const profile = screen.getByRole("link", { name: "profile" });
    const skills = screen.getByRole("link", { name: "skills" });
    const languages = screen.getByRole("link", { name: "languages" });
    const cvs = screen.getByRole("link", { name: "cvs" });
    expect(profile).toHaveAttribute("href", "/users/u1/profile");
    expect(skills).toHaveAttribute("href", "/users/u1/skills");
    expect(languages).toHaveAttribute("href", "/users/u1/languages");
    expect(cvs).toHaveAttribute("href", "/users/u1/cvs");
  });

  it("marks the tab matching the current pathname as active", () => {
    render(<UserProfileTabs userId="u1" />);
    expect(screen.getByRole("link", { name: "skills" })).toHaveClass("text-primary");
  });

  it("does not mark non-matching tabs as active", () => {
    render(<UserProfileTabs userId="u1" />);
    expect(screen.getByRole("link", { name: "profile" })).not.toHaveClass("text-primary");
    expect(screen.getByRole("link", { name: "profile" })).toHaveClass("text-foreground");
  });
});
