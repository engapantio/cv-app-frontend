import type { SkillsQuery } from "@/gql/generated/graphql";

export type SkillItem = SkillsQuery["skills"][number];
