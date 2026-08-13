"use client";
import { useQuery } from "@apollo/client/react";
import { SkillCategoriesDocument } from "@/gql/generated/graphql";

export function useSkillCategoriesList() {
  const query = useQuery(SkillCategoriesDocument, {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });

  return {
    ...query,
    categories: query.data?.skillCategories ?? [],
  };
}
