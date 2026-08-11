import { render, screen } from "@testing-library/react";
import UserCvsClient from "./cvs-client";
import { useCvsPage } from "@/features/cvs/hooks";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@/features/cvs/hooks", () => ({ useCvsPage: jest.fn() }));
jest.mock("@/features/cvs/components/cvs-table", () => ({
  CvsTable: () => <div data-testid="cvs-table" />,
}));

const mockUseCvsPage = useCvsPage as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseCvsPage.mockReturnValue({});
});

describe("UserCvsClient", () => {
  it("renders the cvs table", () => {
    render(
      <UserCvsClient userId="u1" initialCvs={[]} initialUserEmail="a@b.com" serverError={null} />,
    );
    expect(screen.getByTestId("cvs-table")).toBeInTheDocument();
  });

  it("passes props to useCvsPage", () => {
    const cvs = [
      {
        id: "c1",
        created_at: "",
        name: "CV",
        education: null,
        description: "desc",
        user: null,
      } as never,
    ];
    render(
      <UserCvsClient userId="u1" initialCvs={cvs} initialUserEmail="a@b.com" serverError={null} />,
    );
    expect(mockUseCvsPage).toHaveBeenCalledWith({
      userId: "u1",
      initialCvs: cvs,
      initialUserEmail: "a@b.com",
    });
  });
});
