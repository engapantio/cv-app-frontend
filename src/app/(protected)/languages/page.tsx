import { fetchInitialRows } from "@/lib/apollo/initial-data";
import { LanguagesDocument, type LanguagesQuery } from "@/gql/generated/graphql";
import LanguagesClient from "./languages-client";

type LanguageItem = NonNullable<LanguagesQuery["languages"][number]>;

export default async function LanguagesPage() {
  const { initial, serverError } = await fetchInitialRows<LanguagesQuery, LanguageItem>({
    query: LanguagesDocument,
    getData: (data) => (data?.languages ?? []) as Array<LanguageItem | null>,
    sort: (a, b) => a.name.localeCompare(b.name),
    errorMessage: "Failed to load languages",
  });

  return <LanguagesClient initialLanguages={initial} serverError={serverError} />;
}
