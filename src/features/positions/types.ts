import type { PositionsQuery } from "@/gql/generated/graphql";

export type PositionItem = PositionsQuery["positions"][number];
