import type { DepartmentsQuery } from "@/gql/generated/graphql";

export type DepartmentItem = DepartmentsQuery["departments"][number];
