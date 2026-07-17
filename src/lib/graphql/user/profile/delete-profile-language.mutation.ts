import { gql, type TypedDocumentNode } from "@apollo/client";
import type { DeleteProfileLanguageInput, Profile } from "cv-graphql";

type DeleteProfileLanguageMutation = {
  deleteProfileLanguage: Profile;
};

type DeleteProfileLanguageMutationVariables = {
  language: DeleteProfileLanguageInput;
};

export const DELETE_PROFILE_LANGUAGE_MUTATION: TypedDocumentNode<
  DeleteProfileLanguageMutation,
  DeleteProfileLanguageMutationVariables
> = gql`
  mutation DeleteProfileLanguage($language: DeleteProfileLanguageInput!) {
    deleteProfileLanguage(language: $language) {
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
