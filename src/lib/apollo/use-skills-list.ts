"use client";
import { useQuery } from "@apollo/client/react";
import { SkillsDocument } from "@/gql/generated/graphql";

export function useSkillsList() {
  return useQuery(SkillsDocument, {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });
}
