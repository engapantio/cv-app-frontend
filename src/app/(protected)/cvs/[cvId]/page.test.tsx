import { redirect } from "next/navigation";
import CvPage from "./page";

jest.mock("next/navigation", () => ({ redirect: jest.fn() }));

const mockRedirect = redirect as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockRedirect.mockImplementation(() => {
    throw new Error("redirect");
  });
});

describe("CvPage", () => {
  it("redirects to the cv details page", async () => {
    await expect(CvPage({ params: Promise.resolve({ cvId: "cv1" }) })).rejects.toThrow("redirect");
    expect(mockRedirect).toHaveBeenCalledWith("/cvs/cv1/details");
  });
});
