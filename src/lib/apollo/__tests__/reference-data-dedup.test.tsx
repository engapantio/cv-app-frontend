import { ApolloClient, ApolloLink, InMemoryCache, gql, type DocumentNode } from "@apollo/client";
import { ApolloProvider, useQuery } from "@apollo/client/react";
import { MockLink } from "@apollo/client/testing";
import { act, render, screen, waitFor } from "@testing-library/react";
import {
  DepartmentsDocument,
  PositionsDocument,
  SkillsDocument,
  LanguagesDocument,
} from "@/gql/generated/graphql";
import { useDepartmentsList } from "@/lib/apollo/use-departments-list";
import { usePositionsList } from "@/lib/apollo/use-positions-list";
import { useSkillsList } from "@/lib/apollo/use-skills-list";
import { prependCreated, removeById } from "@/lib/apollo/cache-utils";

function ConsumerA() {
  useDepartmentsList();
  usePositionsList();
  useSkillsList();
  return null;
}

function ConsumerB() {
  useDepartmentsList();
  usePositionsList();
  useSkillsList();
  return null;
}

function ListReader({ query }: { query: DocumentNode }) {
  const { data } = useQuery(query, { fetchPolicy: "cache-first" });
  type DataShape = Record<string, { name: string }[]>;
  const dataObj = data as DataShape | undefined;
  const entries = dataObj ? Object.entries(dataObj) : [];
  const items = entries.length > 0 ? entries[0][1] : [];
  const names = items.map((d) => d.name ?? "").join(",");
  return <div data-testid="list-names">{names}</div>;
}

const fieldConfigs: {
  query: DocumentNode;
  field: string;
  typename: string;
  initial: Record<string, unknown>;
  added: Record<string, unknown>;
  fragment: ReturnType<typeof gql>;
  name: string;
}[] = [
  {
    query: DepartmentsDocument,
    field: "departments",
    typename: "Department",
    initial: { id: "d1", created_at: "", name: "Engineering", __typename: "Department" },
    added: { id: "d2", created_at: "", name: "HR", __typename: "Department" },
    fragment: gql`
      fragment NewDepartment on Department {
        id
        created_at
        name
      }
    `,
    name: "Departments",
  },
  {
    query: SkillsDocument,
    field: "skills",
    typename: "Skill",
    initial: {
      id: "s1",
      created_at: "",
      name: "TypeScript",
      category_name: null,
      category_parent_name: null,
      category: null,
      __typename: "Skill",
    },
    added: {
      id: "s2",
      created_at: "",
      name: "Rust",
      category_name: null,
      category_parent_name: null,
      category: null,
      __typename: "Skill",
    },
    fragment: gql`
      fragment NewSkill on Skill {
        __typename
        id
        created_at
        name
        category_name
        category_parent_name
        category {
          __typename
          id
          name
          order
          parent {
            __typename
            id
            name
            order
          }
        }
      }
    `,
    name: "Skills",
  },
  {
    query: LanguagesDocument,
    field: "languages",
    typename: "Language",
    initial: {
      id: "l1",
      created_at: "",
      iso2: "en",
      name: "English",
      native_name: null,
      __typename: "Language",
    },
    added: {
      id: "l2",
      created_at: "",
      iso2: "de",
      name: "German",
      native_name: null,
      __typename: "Language",
    },
    fragment: gql`
      fragment NewLanguage on Language {
        id
        created_at
        iso2
        name
        native_name
      }
    `,
    name: "Languages",
  },
];

describe("shared reference-data hooks deduplicate network requests", () => {
  it("fire exactly one network request per query when multiple consumers mount", async () => {
    const operationCounts = new Map<string, number>();
    const countingLink = new ApolloLink((operation, forward) => {
      const name = operation.operationName ?? "";
      operationCounts.set(name, (operationCounts.get(name) ?? 0) + 1);
      return forward(operation);
    });

    const mockLink = new MockLink([
      {
        request: { query: DepartmentsDocument },
        result: { data: { departments: [] } },
      },
      {
        request: { query: PositionsDocument },
        result: { data: { positions: [] } },
      },
      {
        request: { query: SkillsDocument },
        result: { data: { skills: [] } },
      },
    ]);

    const client = new ApolloClient({
      cache: new InMemoryCache({}),
      link: countingLink.concat(mockLink),
      defaultOptions: { watchQuery: { fetchPolicy: "cache-first" } },
    });

    await act(async () => {
      render(
        <ApolloProvider client={client}>
          <ConsumerA />
          <ConsumerB />
        </ApolloProvider>,
      );
    });

    expect(operationCounts.get("Departments")).toBe(1);
    expect(operationCounts.get("Positions")).toBe(1);
    expect(operationCounts.get("Skills")).toBe(1);
  });

  describe.each(fieldConfigs)(
    "$name cache-modify",
    ({ query, field, initial, added, fragment, name }) => {
      it("reflects a cache-modified $name without a second network request", async () => {
        const operationCounts = new Map<string, number>();
        const countingLink = new ApolloLink((operation, forward) => {
          const opName = operation.operationName ?? "";
          operationCounts.set(opName, (operationCounts.get(opName) ?? 0) + 1);
          return forward(operation);
        });

        const client = new ApolloClient({
          cache: new InMemoryCache({}),
          link: countingLink,
          defaultOptions: { watchQuery: { fetchPolicy: "cache-first" } },
        });

        client.cache.writeQuery({
          query,
          data: { [field]: [initial] } as Record<string, unknown>,
        });

        await act(async () => {
          render(
            <ApolloProvider client={client}>
              <ListReader query={query as DocumentNode} />
            </ApolloProvider>,
          );
        });

        await waitFor(() =>
          expect(screen.getByTestId("list-names").textContent).toBe(initial.name as string),
        );

        expect(operationCounts.get(name)).toBe(undefined);

        await act(async () => {
          prependCreated(client.cache, added, fragment, field);
        });

        await waitFor(() =>
          expect(screen.getByTestId("list-names").textContent).toBe(
            `${added.name as string},${initial.name as string}`,
          ),
        );

        expect(operationCounts.get(name)).toBe(undefined);
      });
    },
  );

  describe.each(fieldConfigs)("$name cache-delete", ({ query, field, initial, added, name }) => {
    it("reflects a cache-removed $name without a second network request", async () => {
      const operationCounts = new Map<string, number>();
      const countingLink = new ApolloLink((operation, forward) => {
        const opName = operation.operationName ?? "";
        operationCounts.set(opName, (operationCounts.get(opName) ?? 0) + 1);
        return forward(operation);
      });

      const client = new ApolloClient({
        cache: new InMemoryCache({}),
        link: countingLink,
        defaultOptions: { watchQuery: { fetchPolicy: "cache-first" } },
      });

      client.cache.writeQuery({
        query,
        data: { [field]: [initial, added] } as Record<string, unknown>,
      });

      await act(async () => {
        render(
          <ApolloProvider client={client}>
            <ListReader query={query as DocumentNode} />
          </ApolloProvider>,
        );
      });

      await waitFor(() =>
        expect(screen.getByTestId("list-names").textContent).toBe(
          `${initial.name as string},${added.name as string}`,
        ),
      );

      expect(operationCounts.get(name)).toBe(undefined);

      client.cache.modify({
        id: "ROOT_QUERY",
        fields: {
          [field]: removeById(initial.id as string),
        },
      });

      await waitFor(() =>
        expect(screen.getByTestId("list-names").textContent).toBe(added.name as string),
      );

      expect(operationCounts.get(name)).toBe(undefined);
    });
  });
});
