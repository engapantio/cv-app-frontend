import { DocumentNode, OperationVariables } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

interface UseDataTableOptions<T, I, V = OperationVariables> {
  query: DocumentNode;
  variables?: V;
  getData: (data: T) => I[];
  initialData?: I[];
  serverError?: string | null;
  alwaysFetch?: boolean;
  fetchPolicy?: "cache-first" | "cache-and-network" | "network-only";
}

export function useDataTable<T, I>({
  query,
  variables = {},
  getData,
  initialData = [],
  serverError,
  alwaysFetch = false,
  fetchPolicy = "network-only",
}: UseDataTableOptions<T, I>) {
  const skip = alwaysFetch ? false : serverError == null;

  const { data, loading, error, refetch } = useQuery<T>(query, {
    variables,
    fetchPolicy,
    errorPolicy: "all",
    skip,
  });

  const items: I[] = data != null ? getData(data) : initialData;

  return {
    data: items,
    isLoading: loading,
    error,
    refetch,
  };
}
