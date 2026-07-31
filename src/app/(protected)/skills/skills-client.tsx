"use client";

import type { SkillsQuery, SkillCategoriesQuery } from "@/gql/generated/graphql";
import { SkillsTable } from "@/features/skills/components/skills-table";
import { useSkillsPage } from "@/features/skills/hooks/use-skills-page";

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
    <div className="flex w-full">
      <main className="flex-1">
        <div className="flex items-center h-11">
          <h1 className="text-base text-foreground/70">Skills</h1>
        </div>
        <SkillsTable {...tableData} serverError={serverError} />
      </main>
    </div>
  );
}
