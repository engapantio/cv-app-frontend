import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MenuItem } from "./menu-item";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FolderIcon } from "lucide-react";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());

const item = { href: "/projects", labelKey: "nav.projects", icon: FolderIcon };

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
}

function renderItem({ isMobile = false, onClick = jest.fn() } = {}) {
  return {
    onClick,
    ...render(
      <SidebarProvider>
        <MenuItem
          item={item}
          label="Projects"
          isActive={false}
          isMobile={isMobile}
          onClick={onClick}
        />
      </SidebarProvider>,
    ),
  };
}

beforeEach(() => {
  jest.useFakeTimers();
  setViewportWidth(375);
});

afterEach(() => {
  jest.useRealTimers();
  setViewportWidth(1024);
});

describe("MenuItem desktop", () => {
  it("renders the icon and the visible text label", () => {
    renderItem();
    expect(screen.getByText("Projects")).toBeVisible();
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/projects");
  });
});

describe("MenuItem phone footer", () => {
  it("renders an icon-only link with an accessible label", () => {
    renderItem({ isMobile: true });
    const link = screen.getByRole("link", { name: "Projects" });
    expect(link).toHaveAttribute("href", "/projects");
    expect(link).toHaveAttribute("aria-label", "Projects");
    expect(within(link).getByText("Projects")).toHaveClass("max-md:hidden");
  });

  it("navigates on a short tap without revealing the label", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { onClick } = renderItem({ isMobile: true });
    const link = screen.getByRole("link", { name: "Projects" });

    fireEvent.touchStart(link);
    fireEvent.touchEnd(link);
    await user.click(link);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText("Projects")).toHaveLength(1);
  });

  it("reveals the label on long-press without navigating", () => {
    const { onClick } = renderItem({ isMobile: true });
    const link = screen.getByRole("link", { name: "Projects" });

    fireEvent.touchStart(link);
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(screen.getAllByText("Projects")).toHaveLength(2);

    fireEvent.touchEnd(link);
    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    const preventDefaultSpy = jest.spyOn(clickEvent, "preventDefault");
    link.dispatchEvent(clickEvent);

    expect(onClick).not.toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(screen.getAllByText("Projects")).toHaveLength(1);
  });

  it("cancels the long-press when the finger moves", () => {
    renderItem({ isMobile: true });
    const link = screen.getByRole("link", { name: "Projects" });

    fireEvent.touchStart(link);
    fireEvent.touchMove(link);
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(screen.getAllByText("Projects")).toHaveLength(1);
  });

  it("reveals the label on hover for pointer devices", () => {
    const originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }),
    });

    renderItem({ isMobile: true });
    const link = screen.getByRole("link", { name: "Projects" });

    act(() => {
      fireEvent.pointerEnter(link, { pointerType: "mouse" });
    });

    expect(screen.getAllByText("Projects")).toHaveLength(2);
    window.matchMedia = originalMatchMedia;
  });
});

describe("MenuItem tablet footer", () => {
  it("renders the text label alongside the icon", () => {
    setViewportWidth(1024);
    renderItem({ isMobile: true });
    expect(screen.getByText("Projects")).toBeVisible();
    const link = screen.getByRole("link", { name: "Projects" });
    expect(link).toHaveAttribute("href", "/projects");
  });
});
