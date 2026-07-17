import { gql, type TypedDocumentNode } from "@apollo/client";
import type { Profile, AddProfileSkillInput } from "cv-graphql";

type AddProfileSkillMutation = {
  addProfileSkill: Profile;
};

type AddProfileSkillMutationVariables = {
  skill: AddProfileSkillInput;
};

export const ADD_PROFILE_SKILL_MUTATION: TypedDocumentNode<
  AddProfileSkillMutation,
  AddProfileSkillMutationVariables
> = gql`
  mutation AddProfileSkill($skill: AddProfileSkillInput!) {
    addProfileSkill(skill: $skill) {
      id
      created_at
      first_name
      last_name
      full_name
      avatar
      skills {
        name
        categoryId
        mastery
      }
      languages {
        name
        proficiency
      }
    }
  }
`;
