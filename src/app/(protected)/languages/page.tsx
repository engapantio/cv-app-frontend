import { fetchInitialRows } from "@/lib/apollo/initial-data";
import { LanguagesDocument, type LanguagesQuery } from "@/gql/generated/graphql";
import LanguagesClient from "./languages-client";

type LanguageItem = NonNullable<LanguagesQuery["languages"][number]>;

export default async function LanguagesPage() {
  const { initial, serverError } = await fetchInitialRows<LanguagesQuery, LanguageItem>({
    query: LanguagesDocument,
    getData: (data) => (data?.languages ?? []) as Array<LanguageItem | null>,
    errorMessage: "Failed to load languages",
    pageSize: 10000,
  });

  return <LanguagesClient initialLanguages={initial} serverError={serverError} />;
}
