import type { Mastery } from "@/gql/generated/graphql";

export interface MasteryConfig {
  percent: number;
  fill: string;
  track: string;
}

export const MASTERY_MAP: Record<Mastery, MasteryConfig> = {
  Novice: { percent: 20, fill: "#767676", track: "#3B3B3B" },
  Advanced: { percent: 40, fill: "#29B6F6", track: "#145B7B" },
  Competent: { percent: 60, fill: "#66BB6A", track: "#335D35" },
  Proficient: { percent: 80, fill: "#FFB800", track: "#7F5C00" },
  Expert: { percent: 100, fill: "#C63031", track: "#C63031" },
};

export const MASTERY_OPTIONS: Mastery[] = [
  "Novice",
  "Advanced",
  "Competent",
  "Proficient",
  "Expert",
];
