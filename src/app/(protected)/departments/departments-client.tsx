"use client";

import type { DepartmentsQuery } from "@/gql/generated/graphql";
import { DepartmentsTable } from "@/features/departments/components/departments-table";
import { useDepartmentsPage } from "@/features/departments/hooks/use-departments-page";
import { TablePageLayout } from "@/components/shared/table-page-layout";
import { useTranslations } from "next-intl";

type DepartmentItem = DepartmentsQuery["departments"][number];

export default function DepartmentsClient({
  initialDepartments,
  serverError,
}: {
  initialDepartments: DepartmentItem[];
  serverError?: string | null;
}) {
  const tableData = useDepartmentsPage(initialDepartments);
  const t = useTranslations("nav");

  return (
    <TablePageLayout title={t("departments")}>
      <DepartmentsTable {...tableData} serverError={serverError} />
    </TablePageLayout>
  );
}
