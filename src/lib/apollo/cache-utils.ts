import type { ModifierDetails } from "@apollo/client/cache";
import type { Reference, StoreObject } from "@apollo/client";

type FieldEntry = Reference | StoreObject;

export const removeById = (id: string) => {
  return <T extends readonly FieldEntry[]>(
    existingRefs: T,
    { readField }: ModifierDetails,
  ): T => existingRefs.filter((ref) => readField("id", ref) !== id) as unknown as T;
};
