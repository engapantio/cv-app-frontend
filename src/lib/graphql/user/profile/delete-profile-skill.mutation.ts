import { gql, type TypedDocumentNode } from "@apollo/client";
import type { DeleteProfileSkillInput, Profile } from "cv-graphql";

type DeleteProfileSkillMutation = {
  deleteProfileSkill: Profile;
};

type DeleteProfileSkillMutationVariables = {
  skill: DeleteProfileSkillInput;
};

export const DELETE_PROFILE_SKILL_MUTATION: TypedDocumentNode<
  DeleteProfileSkillMutation,
  DeleteProfileSkillMutationVariables
> = gql`
  mutation DeleteProfileSkill($skill: DeleteProfileSkillInput!) {
    deleteProfileSkill(skill: $skill) {
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
