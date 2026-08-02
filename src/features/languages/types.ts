import type { LanguagesQuery } from "@/gql/generated/graphql";

export type LanguageItem = NonNullable<LanguagesQuery["languages"][number]>;
