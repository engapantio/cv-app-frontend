import type { CvQuery } from "@/gql/generated/graphql";
import type { CvProjectItem } from "@/features/cvs-projects/types";

type CvData = CvQuery["cv"];

export function makeCvProject(overrides: Partial<CvProjectItem> = {}): CvProjectItem {
  return {
    id: "cp1",
    name: "Alpha",
    internal_name: "alpha",
    description: "First project",
    domain: "Web",
    start_date: "2024-01-01",
    end_date: null,
    environment: ["React"],
    roles: ["Lead"],
    responsibilities: ["Ship it"],
    project: { id: "prj1", name: "Alpha", internal_name: "alpha" },
    ...overrides,
  };
}

export function makeCv(overrides: Partial<CvData> = {}): CvData {
  return {
    id: "cv1",
    created_at: "2024-01-01T00:00:00Z",
    name: "Senior CV",
    education: "BSc",
    description: "Backend CV",
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
    ...overrides,
  };
}
