import { gql, type TypedDocumentNode } from "@apollo/client";
import type { Profile, UpdateProfileLanguageInput } from "cv-graphql";

type UpdateProfileLanguageMutation = {
  updateProfileLanguage: Profile;
};

type UpdateProfileLanguageMutationVariables = {
  language: UpdateProfileLanguageInput;
};

export const UPDATE_PROFILE_LANGUAGE_MUTATION: TypedDocumentNode<
  UpdateProfileLanguageMutation,
  UpdateProfileLanguageMutationVariables
> = gql`
  mutation UpdateProfileLanguage($language: UpdateProfileLanguageInput!) {
    updateProfileLanguage(language: $language) {
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
