import { render, screen } from "@testing-library/react";
import { CvPreviewClient } from "./cv-preview-client";
import { useMutation } from "@apollo/client/react";
import { usePermissions } from "@/lib/auth/permissions";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("@apollo/client/react", () => ({ useMutation: jest.fn() }));
jest.mock("@/lib/auth/permissions", () => ({ usePermissions: jest.fn() }));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
}));

const mockUseMutation = useMutation as unknown as jest.Mock;
const mockUsePermissions = usePermissions as unknown as jest.Mock;

const cv = {
  id: "cv1",
  created_at: "1700000000",
  name: "Senior CV",
  education: "BSc",
  description: "Description",
  user: {
    id: "owner-1",
    email: "owner@b.com",
    position_name: "Developer",
    profile: {
      id: "p1",
      full_name: "Owner One",
      avatar: null,
      languages: [{ name: "English", proficiency: "C1" }],
    },
  },
  projects: [],
  skills: [],
  languages: [],
} as never;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseMutation.mockReturnValue([jest.fn().mockResolvedValue({}), { loading: false }]);
  mockUsePermissions.mockReturnValue({ currentUserId: "owner-1", isAdmin: false });
});

function renderPreview() {
  return render(
    <CvPreviewClient
      initialCv={cv}
      skillCategories={[]}
      serverError={null}
      years={null}
      lastUsed={null}
    />,
  );
}

describe("CvPreviewClient export permissions", () => {
  it("shows the export button to the CV owner", () => {
    mockUsePermissions.mockReturnValue({ currentUserId: "owner-1", isAdmin: false });
    renderPreview();
    expect(screen.getByText("exportPdf")).toBeInTheDocument();
  });

  it("shows the export button to admins viewing another user's CV", () => {
    mockUsePermissions.mockReturnValue({ currentUserId: "admin-1", isAdmin: true });
    renderPreview();
    expect(screen.getByText("exportPdf")).toBeInTheDocument();
  });

  it("hides the export button for regular users viewing another user's CV", () => {
    mockUsePermissions.mockReturnValue({ currentUserId: "someone-else", isAdmin: false });
    renderPreview();
    expect(screen.queryByText("exportPdf")).not.toBeInTheDocument();
  });
});
