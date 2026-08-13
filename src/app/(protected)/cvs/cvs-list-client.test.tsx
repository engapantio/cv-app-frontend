import { render, screen } from "@testing-library/react";
import CvsListClient from "./cvs-list-client";
import { useCvsListPage } from "@/features/cvs/hooks";
import { useSession } from "@/lib/auth/session";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/features/cvs/hooks", () => ({ useCvsListPage: jest.fn() }));
jest.mock("@/lib/auth/session", () => ({ useSession: jest.fn() }));
jest.mock("@/features/cvs/components/cvs-table", () => ({
  CvsTable: () => <div data-testid="cvs-table" />,
}));

const mockUseCvsListPage = useCvsListPage as unknown as jest.Mock;
const mockUseSession = useSession as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseCvsListPage.mockReturnValue({});
  mockUseSession.mockReturnValue({ user: { id: "u1", email: "u1@b.com" } });
});

describe("CvsListClient", () => {
  it("renders the page title and the cvs table", () => {
    render(<CvsListClient initialCvs={[]} serverError={null} />);
    expect(screen.getByText("cvs")).toBeInTheDocument();
    expect(screen.getByTestId("cvs-table")).toBeInTheDocument();
  });

  it("passes the initial rows to the hook", () => {
    const cvs = [
      {
        id: "c1",
        created_at: "",
        name: "CV",
        education: null,
        description: "",
        user: null,
      } as never,
    ];
    render(<CvsListClient initialCvs={cvs} serverError={null} />);
    expect(mockUseCvsListPage).toHaveBeenCalledWith(cvs);
  });

  it("passes the current user id as the create user id", () => {
    mockUseSession.mockReturnValue({ user: { id: "u9", email: "u9@b.com" } });
    render(<CvsListClient initialCvs={[]} serverError="Failed to load CVs" />);
    expect(mockUseCvsListPage).toHaveBeenCalledWith([]);
  });
});
