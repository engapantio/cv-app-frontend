import { render, screen } from "@testing-library/react";
import { UserProfileBreadcrumb } from "./user-profile-breadcrumb";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());

describe("UserProfileBreadcrumb", () => {
  it("renders the employees link and the user name", () => {
    render(<UserProfileBreadcrumb userName="Alice Smith" />);
    const employeesLink = screen.getByRole("link", { name: "employees" });
    expect(employeesLink).toHaveAttribute("href", "/users");
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
  });

  it("renders the tab label when provided", () => {
    render(<UserProfileBreadcrumb userName="Alice Smith" tabLabel="Skills" />);
    expect(screen.getByText("Skills")).toBeInTheDocument();
  });

  it("does not render a tab label when omitted", () => {
    render(<UserProfileBreadcrumb userName="Alice Smith" />);
    expect(screen.queryByText("Skills")).not.toBeInTheDocument();
  });
});
