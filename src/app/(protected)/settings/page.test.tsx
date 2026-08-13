import { render, screen } from "@testing-library/react";
import SettingsPage from "./page";

jest.mock("./settings-client", () => ({
  __esModule: true,
  default: () => <div data-testid="settings-client" />,
}));

describe("SettingsPage", () => {
  it("renders the settings client", () => {
    render(<SettingsPage />);
    expect(screen.getByTestId("settings-client")).toBeInTheDocument();
  });
});
