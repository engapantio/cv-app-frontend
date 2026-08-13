import { InMemoryCache, TypePolicies } from "@apollo/client";

export const typePolicies: TypePolicies = {
  User: {
    keyFields: ["id"],
    fields: {
      profile: { merge: true },
      department: { merge: true },
      position: { merge: true },
      cvs: { merge: false },
    },
  },
  Cv: {
    keyFields: ["id"],
    fields: {
      user: { merge: true },
      projects: { merge: false },
      skills: { merge: false },
      languages: { merge: false },
    },
  },
  Profile: {
    keyFields: ["id"],
    fields: {
      skills: { merge: false },
      languages: { merge: false },
    },
  },
  Department: { keyFields: ["id"] },
  Position: { keyFields: ["id"] },
  Project: { keyFields: ["id"] },
  Skill: { keyFields: ["id"] },
  Language: { keyFields: ["id"] },
  SkillCategory: { keyFields: ["id"] },
  CvProject: { keyFields: ["id"] },
  SkillMastery: { keyFields: false },
  LanguageProficiency: { keyFields: false },
  Query: {
    fields: {
      user: { keyArgs: ["userId"] },
      cv: { keyArgs: ["cvId"] },
      profile: { keyArgs: ["userId"] },
      project: { keyArgs: ["projectId"] },
      position: { keyArgs: ["id"] },
      users: { merge: false },
      cvs: { merge: false },
      departments: { merge: false },
      positions: { merge: false },
      projects: { merge: false },
      skills: { merge: false },
      languages: { merge: false },
      skillCategories: { merge: false },
    },
  },
};

export const cache = new InMemoryCache({ typePolicies });