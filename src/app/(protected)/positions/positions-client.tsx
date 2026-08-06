"use client";

import type { PositionsQuery } from "@/gql/generated/graphql";
import { PositionsTable } from "@/features/positions/components/positions-table";
import { usePositionsPage } from "@/features/positions/hooks/use-positions-page";
import { TablePageLayout } from "@/components/shared/table-page-layout";
import { useTranslations } from "next-intl";

type PositionItem = PositionsQuery["positions"][number];

export default function PositionsClient({
  initialPositions,
  serverError,
}: {
  initialPositions: PositionItem[];
  serverError?: string | null;
}) {
  const tableData = usePositionsPage(initialPositions);
  const t = useTranslations("nav");

  return (
    <TablePageLayout title={t("positions")}>
      <PositionsTable {...tableData} serverError={serverError} />
    </TablePageLayout>
  );
}
