import { render, screen } from "@testing-library/react";
import { UserSkillsClient } from "./user-skills-client";
import { useUserSkillsPage } from "@/features/user-skills/hooks/use-user-skills-page";

jest.mock("next-intl", () => require("@/test-utils/mocks").mockNextIntl());
jest.mock("lucide-react", () => require("@/test-utils/mocks").mockLucide());
jest.mock("@/features/user-skills/hooks/use-user-skills-page", () => ({
  useUserSkillsPage: jest.fn(),
}));
jest.mock("@/components/ui/button", () => require("@/test-utils/ui-mock"));

const mockUseUserSkillsPage = useUserSkillsPage as unknown as jest.Mock;

const defaultReturn = {
  loading: false,
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

beforeEach(() => {
  jest.clearAllMocks();
  mockUseUserSkillsPage.mockReturnValue(defaultReturn);
});

describe("UserSkillsClient", () => {
  it("shows the loading state", () => {
    mockUseUserSkillsPage.mockReturnValue({ ...defaultReturn, loading: true });
    render(
      <UserSkillsClient
        userId="u1"
        initialUser={null}
        skillsCatalog={{ skills: [], categories: [] }}
      />,
    );
    expect(screen.getByText("loading")).toBeInTheDocument();
  });

  it("shows the empty state when there are no skills", () => {
    render(
      <UserSkillsClient
        userId="u1"
        initialUser={null}
        skillsCatalog={{ skills: [], categories: [] }}
      />,
    );
    expect(screen.getByText("noSkillsAssigned")).toBeInTheDocument();
  });

  it("renders the add skill button in the empty state for users who can mutate", () => {
    render(
      <UserSkillsClient
        userId="u1"
        initialUser={null}
        skillsCatalog={{ skills: [], categories: [] }}
      />,
    );
    expect(screen.getByText(/addSkill/)).toBeInTheDocument();
  });

  it("renders skill categories and skills", () => {
    mockUseUserSkillsPage.mockReturnValue({
      ...defaultReturn,
      skillsByCategory: [
        {
          categoryId: "Development",
          categoryName: "Development",
          skills: [{ name: "TypeScript", mastery: "Proficient" as const, categoryId: "c1" }],
        },
      ],
    });
    render(
      <UserSkillsClient
        userId="u1"
        initialUser={null}
        skillsCatalog={{ skills: [], categories: [] }}
      />,
    );
    expect(screen.getByText("Development")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("renders remove mode controls", () => {
    mockUseUserSkillsPage.mockReturnValue({
      ...defaultReturn,
      skillsByCategory: [
        {
          categoryId: "Dev",
          categoryName: "Dev",
          skills: [{ name: "TS", mastery: "Proficient" as const, categoryId: "c1" }],
        },
      ],
      removeMode: true,
    });
    render(
      <UserSkillsClient
        userId="u1"
        initialUser={null}
        skillsCatalog={{ skills: [], categories: [] }}
      />,
    );
    expect(screen.getByText("cancel")).toBeInTheDocument();
    expect(screen.getByText("delete")).toBeInTheDocument();
  });

  it("shows the selected skills count badge in remove mode", () => {
    mockUseUserSkillsPage.mockReturnValue({
      ...defaultReturn,
      skillsByCategory: [
        {
          categoryId: "Dev",
          categoryName: "Dev",
          skills: [{ name: "TS", mastery: "Proficient" as const, categoryId: "c1" }],
        },
      ],
      removeMode: true,
      selectedSkills: new Set(["TS"]),
    });
    render(
      <UserSkillsClient
        userId="u1"
        initialUser={null}
        skillsCatalog={{ skills: [], categories: [] }}
      />,
    );
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
