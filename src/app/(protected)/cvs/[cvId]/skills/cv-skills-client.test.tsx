import { render, screen } from "@testing-library/react";
import { CvSkillsClient } from "./cv-skills-client";
import { useCvSkillsPage } from "@/features/cvs-skills/hooks/use-cv-skills-page";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@/features/cvs-skills/hooks/use-cv-skills-page", () => ({
  useCvSkillsPage: jest.fn(),
}));
jest.mock("@/components/ui/button", () => require("@/test-utils/ui-mock"));

const mockUseCvSkillsPage = useCvSkillsPage as unknown as jest.Mock;

const defaultReturn = {
  loading: false,
  hasCv: true,
  skillsByCategory: [],
  availableSkills: [],
  canMutate: true,
  removeMode: false,
  selectedSkills: new Set<string>(),
  toggleSkillSelection: jest.fn(),
  enterRemoveMode: jest.fn(),
  cancelRemove: jest.fn(),
  addDialogOpen: false,
  setAddDialogOpen: jest.fn(),
  updateSkillTarget: null,
  setUpdateSkillTarget: jest.fn(),
  handleAddSkill: jest.fn(),
  handleUpdateSkill: jest.fn(),
  handleDeleteSkills: jest.fn(),
  addingSkill: false,
  updatingSkill: false,
  deletingSkill: false,
};

function renderClient() {
  return render(
    <CvSkillsClient
      cvId="cv1"
      initialCv={null}
      serverError={null}
      skillsCatalog={{ skills: [], categories: [] }}
    />,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseCvSkillsPage.mockReturnValue(defaultReturn);
});

describe("CvSkillsClient", () => {
  it("shows the loading state", () => {
    mockUseCvSkillsPage.mockReturnValue({ ...defaultReturn, loading: true });
    renderClient();
    expect(screen.getByText("loading")).toBeInTheDocument();
  });

  it("shows the server error when the cv is missing", () => {
    mockUseCvSkillsPage.mockReturnValue({ ...defaultReturn, hasCv: false });
    render(
      <CvSkillsClient
        cvId="cv1"
        initialCv={null}
        serverError="Failed to load CV"
        skillsCatalog={{ skills: [], categories: [] }}
      />,
    );
    expect(screen.getByText("Failed to load CV")).toBeInTheDocument();
  });

  it("shows the empty state when there are no skills", () => {
    renderClient();
    expect(screen.getByText("noSkillsAssigned")).toBeInTheDocument();
  });

  it("renders the add skill button in the empty state for users who can mutate", () => {
    renderClient();
    expect(screen.getByText(/addSkill/)).toBeInTheDocument();
  });

  it("hides the add skill button in the empty state for read-only users", () => {
    mockUseCvSkillsPage.mockReturnValue({ ...defaultReturn, canMutate: false });
    renderClient();
    expect(screen.queryByText(/addSkill/)).not.toBeInTheDocument();
  });

  it("renders skill categories and skills", () => {
    mockUseCvSkillsPage.mockReturnValue({
      ...defaultReturn,
      skillsByCategory: [
        {
          categoryId: "Development",
          categoryName: "Development",
          skills: [{ name: "TypeScript", mastery: "Proficient", categoryId: "c1" }],
        },
      ],
    });
    renderClient();
    expect(screen.getByText("Development")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("renders remove mode controls", () => {
    mockUseCvSkillsPage.mockReturnValue({
      ...defaultReturn,
      skillsByCategory: [
        {
          categoryId: "Dev",
          categoryName: "Dev",
          skills: [{ name: "TS", mastery: "Proficient", categoryId: "c1" }],
        },
      ],
      removeMode: true,
    });
    renderClient();
    expect(screen.getByText("cancel")).toBeInTheDocument();
    expect(screen.getByText("delete")).toBeInTheDocument();
  });

  it("shows the selected skills count badge in remove mode", () => {
    mockUseCvSkillsPage.mockReturnValue({
      ...defaultReturn,
      skillsByCategory: [
        {
          categoryId: "Dev",
          categoryName: "Dev",
          skills: [{ name: "TS", mastery: "Proficient", categoryId: "c1" }],
        },
      ],
      removeMode: true,
      selectedSkills: new Set(["TS"]),
    });
    renderClient();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
