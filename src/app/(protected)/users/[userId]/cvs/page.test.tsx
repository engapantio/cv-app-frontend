import { render, screen } from "@testing-library/react";
import UserCvsPage from "./page";
import { fetchInitialRows } from "@/lib/apollo/initial-data";

jest.mock("@/lib/apollo/initial-data", () => ({ fetchInitialRows: jest.fn() }));
jest.mock("./cvs-client", () => ({
  __esModule: true,
  default: () => <div data-testid="cvs-client" />,
}));

const mockFetchInitialRows = fetchInitialRows as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchInitialRows.mockResolvedValue({
    initial: [],
    serverError: null,
    extra: "a@b.com",
  });
});

describe("UserCvsPage", () => {
  it("renders the cvs client", async () => {
    render(await UserCvsPage({ params: Promise.resolve({ userId: "u1" }) }));
    expect(screen.getByTestId("cvs-client")).toBeInTheDocument();
  });

  it("calls fetchInitialRows with the user CV data", async () => {
    render(await UserCvsPage({ params: Promise.resolve({ userId: "u1" }) }));
    expect(mockFetchInitialRows).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.anything(),
        variables: { userId: "u1" },
        errorMessage: "Failed to load CVs",
      }),
    );
  });
});
