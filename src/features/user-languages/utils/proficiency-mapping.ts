// import type { Proficiency } from "@/gql/generated/graphql";

import type { Proficiency } from "@/gql/generated/graphql";

export interface ProficiencyConfig {
  color: string;
}

export const PROFICIENCY_MAP: Record<Proficiency, ProficiencyConfig> = {
  A1: { color: "#767676" },
  A2: { color: "#29B6F6" },
  B1: { color: "#FFB800" },
  B2: { color: "#66BB6A" },
  C1: { color: "#C63031" },
  C2: { color: "#8E44AD" },
  Native: { color: "#C63031" },
};

export const PROFICIENCY_OPTIONS: Proficiency[] = ["A1", "A2", "B1", "B2", "C1", "C2", "Native"];
