import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsClient from "./settings-client";
import { useTheme } from "next-themes";
import { useLocalePref, setLocale } from "@/lib/preferences/locale";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("next-themes", () => ({ useTheme: jest.fn() }));
jest.mock("@/components/ui", () => require("@/test-utils/ui-mock"));
jest.mock("@/components/shared/table-page-layout", () => ({
  TablePageLayout: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));
jest.mock("@/lib/preferences/locale", () => ({
  useLocalePref: jest.fn(),
  setLocale: jest.fn(),
}));

const mockUseTheme = useTheme as unknown as jest.Mock;
const mockUseLocalePref = useLocalePref as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseTheme.mockReturnValue({ theme: "system", setTheme: jest.fn() });
  mockUseLocalePref.mockReturnValue("en");
});

describe("SettingsClient", () => {
  it("renders the appearance and language selects", () => {
    render(<SettingsClient />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Appearance")).toBeInTheDocument();
    expect(screen.getByText("Language")).toBeInTheDocument();
  });

  it("maps the light theme to the light appearance value", () => {
    mockUseTheme.mockReturnValue({ theme: "light", setTheme: jest.fn() });
    render(<SettingsClient />);
    expect(screen.getAllByTestId("select-value")[0]).toHaveTextContent("Light");
  });

  it("maps the dark theme to the dark appearance value", () => {
    mockUseTheme.mockReturnValue({ theme: "dark", setTheme: jest.fn() });
    render(<SettingsClient />);
    expect(screen.getAllByTestId("select-value")[0]).toHaveTextContent("Dark");
  });

  it("applies the theme when the appearance select changes", async () => {
    const user = userEvent.setup();
    const setTheme = jest.fn();
    mockUseTheme.mockReturnValue({ theme: "system", setTheme });
    render(<SettingsClient />);
    await user.click(screen.getAllByTestId("select-value")[0]);
    await user.click(document.querySelector('[data-value="dark"]') as HTMLButtonElement);
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("stores the locale when the language select changes", async () => {
    const user = userEvent.setup();
    render(<SettingsClient />);
    await user.click(screen.getAllByTestId("select-value")[1]);
    await user.click(document.querySelector('[data-value="ru"]') as HTMLButtonElement);
    expect(setLocale).toHaveBeenCalledWith("ru");
  });
});
