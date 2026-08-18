import type { Proficiency } from "@/gql/generated/graphql";

interface ProficiencyConfig {
  color: string;
}

export const PROFICIENCY_MAP: Record<Proficiency, ProficiencyConfig> = {
  A1: { color: "#767676" },
  A2: { color: "#29B6F6" },
  B1: { color: "#A5D6A7" },
  B2: { color: "#66BB6A" },
  C1: { color: "#FFB800" },
  C2: { color: "#8E44AD" },
  Native: { color: "#C63031" },
};

export const PROFICIENCY_OPTIONS: Proficiency[] = Object.keys(PROFICIENCY_MAP) as Proficiency[];
