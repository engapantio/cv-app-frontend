import type { ApolloCache } from "@apollo/client";
import type { ModifierDetails } from "@apollo/client/cache";
import type { Reference, StoreObject } from "@apollo/client";
import type { DocumentNode } from "graphql";

type FieldEntry = Reference | StoreObject;

export const removeById = (id: string) => {
  return <T>(existingRefs: T, { readField }: ModifierDetails): T => {
    const current = (Array.isArray(existingRefs) ? existingRefs : []) as FieldEntry[];
    return current.filter((ref) => readField("id", ref) !== id) as T;
  };
};

export function prependCreated(
  cache: ApolloCache,
  data: unknown,
  fragment: DocumentNode,
  field: string,
) {
  cache.modify({
    fields: {
      [field](existingRefs: unknown) {
        const newRef = cache.writeFragment({ data, fragment });
        if (typeof newRef === "undefined") return existingRefs;
        const current = Array.isArray(existingRefs) ? existingRefs : [];
        return [newRef, ...current];
      },
    },
  });
}
