import { gql, type TypedDocumentNode } from "@apollo/client";
import type { Profile, UpdateProfileSkillInput } from "cv-graphql";

type UpdateProfileSkillMutation = {
  updateProfileSkill: Profile;
};

type UpdateProfileSkillMutationVariables = {
  skill: UpdateProfileSkillInput;
};

export const UPDATE_PROFILE_SKILL_MUTATION: TypedDocumentNode<
  UpdateProfileSkillMutation,
  UpdateProfileSkillMutationVariables
> = gql`
  mutation UpdateProfileSkill($skill: UpdateProfileSkillInput!) {
    updateProfileSkill(skill: $skill) {
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
