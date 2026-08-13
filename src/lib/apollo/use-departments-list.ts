"use client";
import { useQuery } from "@apollo/client/react";
import { DepartmentsDocument } from "@/gql/generated/graphql";

export function useDepartmentsList() {
  return useQuery(DepartmentsDocument, {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });
}
