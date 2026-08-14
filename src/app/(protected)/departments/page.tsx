import { fetchInitialRows } from "@/lib/apollo/initial-data";
import { DepartmentsDocument, type DepartmentsQuery } from "@/gql/generated/graphql";
import DepartmentsClient from "./departments-client";

type DepartmentItem = DepartmentsQuery["departments"][number];

export default async function DepartmentsPage() {
  const { initial, serverError } = await fetchInitialRows<DepartmentsQuery, DepartmentItem>({
    query: DepartmentsDocument,
    getData: (data) => (data?.departments ?? []) as DepartmentItem[],
    errorMessage: "Failed to load departments",
    pageSize: 10000,
  });

  return <DepartmentsClient initialDepartments={initial} serverError={serverError} />;
}
