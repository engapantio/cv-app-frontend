import { InMemoryCache, Reference, TypePolicies } from "@apollo/client";
import type { FieldMergeFunctionOptions } from "@apollo/client/cache";

type PaginationArgs = {
  offset?: number | null;
  search?: string | null;
  sort?: string | null;
  filter?: string | null;
  userId?: string | null;
  departmentId?: string | null;
  positionId?: string | null;
  cvId?: string | null;
  projectId?: string | null;
};

function paginatedFieldPolicy<T = Reference>(fieldName = "items") {
  return {
    keyArgs: [
      "search",
      "sort",
      "filter",
      "userId",
      "departmentId",
      "positionId",
      "cvId",
      "projectId",
    ],
    merge(
      existing: Record<string, unknown> = { [fieldName]: [] },
      incoming: Record<string, unknown>,
      options: FieldMergeFunctionOptions<Record<string, unknown>, Record<string, unknown>>,
    ) {
      const args = (options.args ?? {}) as PaginationArgs;
      const offset = typeof args.offset === "number" ? args.offset : 0;

      const existingItems = Array.isArray(existing[fieldName]) ? (existing[fieldName] as T[]) : [];
      const incomingItems = Array.isArray(incoming[fieldName]) ? (incoming[fieldName] as T[]) : [];
      const merged = existingItems.slice(0);

      for (let i = 0; i < incomingItems.length; i += 1) {
        merged[offset + i] = incomingItems[i];
      }

      return {
        ...incoming,
        [fieldName]: merged,
      };
    },
  };
}

export const typePolicies: TypePolicies = {
  User: {
    keyFields: ["id"],
    fields: {
      profile: { merge: true },
      department: { merge: true },
      position: { merge: true },
      cvs: { merge: true },
    },
  },
  Cv: {
    keyFields: ["id"],
    fields: {
      user: { merge: true },
      projects: { merge: true },
      skills: { merge: true },
      languages: { merge: true },
    },
  },
  Profile: {
    keyFields: ["id"],
    fields: {
      skills: { merge: true },
      languages: { merge: true },
    },
  },
  Department: { keyFields: ["id"] },
  Position: { keyFields: ["id"] },
  Project: { keyFields: ["id"] },
  Skill: { keyFields: ["id"] },
  Language: { keyFields: ["id"] },
  SkillCategory: { keyFields: ["id"] },
  Query: {
    fields: {
      user: { keyArgs: ["userId"] },
      cv: { keyArgs: ["cvId"] },
      profile: { keyArgs: ["userId"] },
      project: { keyArgs: ["projectId"] },
      position: { keyArgs: ["id"] },
      users: paginatedFieldPolicy("items"),
      cvs: paginatedFieldPolicy("items"),
      departments: paginatedFieldPolicy("items"),
      positions: paginatedFieldPolicy("items"),
      projects: paginatedFieldPolicy("items"),
      skills: paginatedFieldPolicy("items"),
      languages: paginatedFieldPolicy("items"),
      skillCategories: { merge: true },
    },
  },
};

export const cache = new InMemoryCache({ typePolicies });
