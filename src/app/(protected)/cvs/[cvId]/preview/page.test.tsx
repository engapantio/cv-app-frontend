import { render, screen } from "@testing-library/react";
import CvPreviewPage from "./page";
import { createServerApolloClientForRequest } from "@/lib/apollo/server-client";
import { makeCv } from "@/test-utils/cv-fixtures";

jest.mock("@/lib/apollo/server-client", () => ({ createServerApolloClientForRequest: jest.fn() }));
jest.mock("./cv-preview-client", () => ({
  CvPreviewClient: () => <div data-testid="preview-client" />,
}));

const mockCreateClient = createServerApolloClientForRequest as unknown as jest.Mock;

const cv = makeCv();

beforeEach(() => {
  jest.clearAllMocks();
  mockCreateClient.mockResolvedValue({
    client: {
      query: jest.fn().mockResolvedValue({ data: { cv } }),
    },
    accessToken: "token",
  });
});

describe("CvPreviewPage", () => {
  it("renders the preview client when authenticated", async () => {
    render(await CvPreviewPage({ params: Promise.resolve({ cvId: "cv1" }) }));
    expect(screen.getByTestId("preview-client")).toBeInTheDocument();
  });

  it("passes a server error when there is no token", async () => {
    mockCreateClient.mockResolvedValue({ client: {}, accessToken: null });
    render(await CvPreviewPage({ params: Promise.resolve({ cvId: "cv1" }) }));
    expect(screen.getByTestId("preview-client")).toBeInTheDocument();
  });

  it("passes a not-found server error when the cv is missing", async () => {
    mockCreateClient.mockResolvedValue({
      client: {
        query: jest.fn().mockResolvedValue({ data: { cv: null } }),
      },
      accessToken: "token",
    });
    render(await CvPreviewPage({ params: Promise.resolve({ cvId: "missing" }) }));
    expect(screen.getByTestId("preview-client")).toBeInTheDocument();
  });

  it("passes a server error when the queries throw", async () => {
    mockCreateClient.mockResolvedValue({
      client: {
        query: jest.fn().mockRejectedValue(new Error("Failed to load CV")),
      },
      accessToken: "token",
    });
    render(await CvPreviewPage({ params: Promise.resolve({ cvId: "cv1" }) }));
    expect(screen.getByTestId("preview-client")).toBeInTheDocument();
  });
});
