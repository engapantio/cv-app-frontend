"use client";
import { useQuery } from "@apollo/client/react";
import { PositionsDocument } from "@/gql/generated/graphql";

export function usePositionsList() {
  return useQuery(PositionsDocument, {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });
}
