import type { DocumentNode, ErrorPolicy } from "@apollo/client";
import { createServerApolloClientForRequest } from "@/lib/apollo/server-client";
import { SkillCategoriesDocument, SkillsDocument } from "@/gql/generated/graphql";
import type { SkillsCatalogInitial } from "@/lib/skills/group-skills";

interface ServerQueryOptions {
  errorPolicy?: ErrorPolicy;
  requireAuth?: boolean;
}

interface ServerQueryResult<TQuery> {
  data: TQuery | undefined;
  error: string | null;
}

async function queryServer<TQuery>(
  query: DocumentNode,
  variables: Record<string, unknown> | undefined,
  fallbackMessage: string,
  { errorPolicy = "all", requireAuth = false }: ServerQueryOptions = {},
): Promise<ServerQueryResult<TQuery>> {
  try {
    const { client, accessToken } = await createServerApolloClientForRequest();

    if (requireAuth && !accessToken) {
      return { data: undefined, error: "Unauthorized" };
    }

    const { data } = await client.query<TQuery>({
      query,
      variables,
      errorPolicy,
      fetchPolicy: "no-cache",
    });
    return { data, error: null };
  } catch (e) {
    return { data: undefined, error: e instanceof Error ? e.message : fallbackMessage };
  }
}

interface InitialRowsResult<TItem, TExtra = null> {
  initial: TItem[];
  serverError: string | null;
  extra: TExtra;
}

interface FetchInitialRowsOptions<TQuery, TItem, TExtra> {
  query: DocumentNode;
  variables?: Record<string, unknown>;
  getData: (data: TQuery | undefined) => Array<TItem | null | undefined>;
  sort?: (a: TItem, b: TItem) => number;
  pageSize?: number;
  errorMessage: string;
  errorPolicy?: ErrorPolicy;
  requireAuth?: boolean;
  select?: (data: TQuery | undefined) => TExtra;
}

export async function fetchInitialRows<TQuery, TItem, TExtra = null>({
  query,
  variables,
  getData,
  sort,
  pageSize = 10,
  errorMessage,
  errorPolicy,
  requireAuth,
  select,
}: FetchInitialRowsOptions<TQuery, TItem, TExtra>): Promise<InitialRowsResult<TItem, TExtra>> {
  const { data, error } = await queryServer<TQuery>(query, variables, errorMessage, {
    errorPolicy,
    requireAuth,
  });

  if (error != null) {
    return { initial: [], serverError: error, extra: select ? select(data) : (null as TExtra) };
  }

  const rows = getData(data).filter((row): row is TItem => row !== null && row !== undefined);

  return {
    initial: (sort ? [...rows].sort(sort) : rows).slice(0, pageSize),
    serverError: null,
    extra: select ? select(data) : (null as TExtra),
  };
}

interface InitialRecordResult<TRecord> {
  initial: TRecord | null;
  serverError: string | null;
}

interface FetchInitialRecordOptions<TQuery, TRecord> {
  query: DocumentNode;
  variables?: Record<string, unknown>;
  getRecord: (data: TQuery | undefined) => TRecord | null | undefined;
  errorMessage: string;
  errorPolicy?: ErrorPolicy;
  requireAuth?: boolean;
  notFoundMessage?: string;
}

export async function fetchSkillsCatalog(): Promise<SkillsCatalogInitial> {
  try {
    const { client } = await createServerApolloClientForRequest();
    const [skillsRes, categoriesRes] = await Promise.all([
      client.query({ query: SkillsDocument, fetchPolicy: "no-cache" }),
      client.query({ query: SkillCategoriesDocument, fetchPolicy: "no-cache" }),
    ]);
    return {
      skills: skillsRes.data?.skills ?? [],
      categories: categoriesRes.data?.skillCategories ?? [],
    };
  } catch {
    return { skills: [], categories: [] };
  }
}

export async function fetchInitialRecord<TQuery, TRecord>({
  query,
  variables,
  getRecord,
  errorMessage,
  errorPolicy,
  requireAuth,
  notFoundMessage,
}: FetchInitialRecordOptions<TQuery, TRecord>): Promise<InitialRecordResult<TRecord>> {
  const { data, error } = await queryServer<TQuery>(query, variables, errorMessage, {
    errorPolicy,
    requireAuth,
  });

  if (error != null) {
    return { initial: null, serverError: error };
  }

  const record = getRecord(data) ?? null;
  if (record == null && notFoundMessage != null) {
    return { initial: null, serverError: notFoundMessage };
  }

  return { initial: record, serverError: null };
}
