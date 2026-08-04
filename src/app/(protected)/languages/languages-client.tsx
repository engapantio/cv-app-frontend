"use client";

import type { LanguagesQuery } from "@/gql/generated/graphql";
import { LanguagesTable } from "@/features/languages/components/languages-table";
import { useLanguagesPage } from "@/features/languages/hooks/use-languages-page";
import { TablePageLayout } from "@/components/shared/table-page-layout";
import { useTranslations } from "next-intl";

type LanguageItem = NonNullable<LanguagesQuery["languages"][number]>;

export default function LanguagesClient({
  initialLanguages,
  serverError,
}: {
  initialLanguages: LanguageItem[];
  serverError?: string | null;
}) {
  const tableData = useLanguagesPage(initialLanguages);
  const t = useTranslations("nav");

  return (
    <TablePageLayout title={t("languages")}>
      <LanguagesTable {...tableData} serverError={serverError} />
    </TablePageLayout>
  );
}
