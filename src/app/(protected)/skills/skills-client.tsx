"use client";

import type { SkillsQuery, SkillCategoriesQuery } from "@/gql/generated/graphql";
import { SkillsTable } from "@/features/skills/components/skills-table";
import { useSkillsPage } from "@/features/skills/hooks/use-skills-page";
import { TablePageLayout } from "@/components/shared/table-page-layout";

type SkillItem = SkillsQuery["skills"][number];

export default function SkillsClient({
  initialSkills,
  initialCategories,
  serverError,
}: {
  initialSkills: SkillItem[];
  initialCategories: SkillCategoriesQuery["skillCategories"];
  serverError?: string | null;
}) {
  const tableData = useSkillsPage(initialSkills, serverError, initialCategories);

  return (
    <TablePageLayout title="Skills">
      <SkillsTable {...tableData} serverError={serverError} />
    </TablePageLayout>
  );
}
