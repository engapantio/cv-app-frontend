import { fetchInitialRows } from "@/lib/apollo/initial-data";
import { PositionsDocument, type PositionsQuery } from "@/gql/generated/graphql";
import PositionsClient from "./positions-client";

type PositionItem = PositionsQuery["positions"][number];

export default async function PositionsPage() {
  const { initial, serverError } = await fetchInitialRows<PositionsQuery, PositionItem>({
    query: PositionsDocument,
    getData: (data) => (data?.positions ?? []) as PositionItem[],
    sort: (a, b) => a.name.localeCompare(b.name),
    errorMessage: "Failed to load positions",
  });

  return <PositionsClient initialPositions={initial} serverError={serverError} />;
}
