import { gql, type TypedDocumentNode } from "@apollo/client";
import type { UpdateProfileInput, Profile } from "cv-graphql";

type UpdateProfileMutation = {
  updateProfile: Profile;
};

type UpdateProfileMutationVariables = {
  profile: UpdateProfileInput;
};

export const UPDATE_PROFILE_MUTATION: TypedDocumentNode<
  UpdateProfileMutation,
  UpdateProfileMutationVariables
> = gql`
  mutation UpdateProfile($profile: UpdateProfileInput!) {
    updateProfile(profile: $profile) {
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
