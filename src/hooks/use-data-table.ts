import { DocumentNode, OperationVariables } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

interface UseDataTableOptions<T, I, V = OperationVariables> {
  query: DocumentNode;
  variables?: V;
  getData: (data: T) => I[];
}

export function useDataTable<T, I>({ query, variables = {}, getData }: UseDataTableOptions<T, I>) {
  const { data, loading, error, refetch } = useQuery<T>(query, {
    variables,
    fetchPolicy: "network-only",
  });

  const items: I[] = data ? getData(data) : [];

  return {
    data: items,
    isLoading: loading,
    error,
    refetch,
  };
}
