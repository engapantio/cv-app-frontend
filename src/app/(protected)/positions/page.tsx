import { fetchInitialRows } from "@/lib/apollo/initial-data";
import { PositionsDocument, type PositionsQuery } from "@/gql/generated/graphql";
import PositionsClient from "./positions-client";

type PositionItem = PositionsQuery["positions"][number];

export default async function PositionsPage() {
  const { initial, serverError } = await fetchInitialRows<PositionsQuery, PositionItem>({
    query: PositionsDocument,
    getData: (data) => (data?.positions ?? []) as PositionItem[],
    errorMessage: "Failed to load positions",
    pageSize: 10000,
  });

  return <PositionsClient initialPositions={initial} serverError={serverError} />;
}
