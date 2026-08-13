import { render, screen } from "@testing-library/react";
import { AuthTabsSwitcher } from "./auth-tabs-switcher";
import { usePathname } from "next/navigation";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("next/navigation", () => ({ usePathname: jest.fn() }));

const mockUsePathname = usePathname as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUsePathname.mockReturnValue("/auth/login");
});

describe("AuthTabsSwitcher", () => {
  it("renders nothing on non-auth pages", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    const { container } = render(<AuthTabsSwitcher />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the login and signup tabs", () => {
    render(<AuthTabsSwitcher />);
    expect(screen.getByRole("link", { name: "login" })).toHaveAttribute("href", "/auth/login");
    expect(screen.getByRole("link", { name: "signup" })).toHaveAttribute("href", "/auth/signup");
  });

  it("marks the current path tab as active", () => {
    mockUsePathname.mockReturnValue("/auth/signup");
    const { container } = render(<AuthTabsSwitcher />);
    expect(container).not.toBeEmptyDOMElement();
  });
});
