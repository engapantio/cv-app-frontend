import { render, screen } from "@testing-library/react";
import { CvLayoutClient } from "./cv-layout-client";
import { usePathname } from "next/navigation";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("next/navigation", () => ({ usePathname: jest.fn() }));
jest.mock("@/components/shared/tab-nav", () => ({
  TabNav: ({ items }: { items: { key: string; label: string; href: string }[] }) => (
    <nav>
      {items.map((item) => (
        <a key={item.key} href={item.href}>
          {item.label}
        </a>
      ))}
    </nav>
  ),
}));

const mockUsePathname = usePathname as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUsePathname.mockReturnValue("/cvs/cv1/details");
});

describe("CvLayoutClient", () => {
  it("renders the breadcrumb, tabs and children", () => {
    render(
      <CvLayoutClient cvId="cv1" initialCvName="Senior CV" cvUserId={null}>
        <div>content</div>
      </CvLayoutClient>,
    );
    expect(screen.getByText("cvs")).toBeInTheDocument();
    expect(screen.getByText("Senior CV")).toBeInTheDocument();
    expect(screen.getAllByText("details").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("link", { name: "skills" })).toHaveAttribute("href", "/cvs/cv1/skills");
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("falls back to the CV name when none is provided", () => {
    render(
      <CvLayoutClient cvId="cv1" initialCvName={null} cvUserId={null}>
        <div>content</div>
      </CvLayoutClient>,
    );
    expect(screen.getByText("CV")).toBeInTheDocument();
  });

  it("links the breadcrumb to the user cvs when cvUserId is set", () => {
    render(
      <CvLayoutClient cvId="cv1" initialCvName="Senior CV" cvUserId="u1">
        <div>content</div>
      </CvLayoutClient>,
    );
    expect(screen.getByRole("link", { name: "cvs" })).toHaveAttribute("href", "/users/u1/cvs");
  });

  it("uses the current path segment as the tab label when unknown", () => {
    mockUsePathname.mockReturnValue("/cvs/cv1/custom");
    render(
      <CvLayoutClient cvId="cv1" initialCvName="Senior CV" cvUserId={null}>
        <div>content</div>
      </CvLayoutClient>,
    );
    expect(screen.getByText("custom")).toBeInTheDocument();
  });
});
