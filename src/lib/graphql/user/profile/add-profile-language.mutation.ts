import { gql, type TypedDocumentNode } from "@apollo/client";
import type { Profile, AddProfileLanguageInput } from "cv-graphql";

type AddProfileLanguageMutation = {
  addProfileLanguage: Profile;
};

type AddProfileLanguageMutationVariables = {
  language: AddProfileLanguageInput;
};

export const ADD_PROFILE_LANGUAGE_MUTATION: TypedDocumentNode<
  AddProfileLanguageMutation,
  AddProfileLanguageMutationVariables
> = gql`
  mutation AddProfileLanguage($language: AddProfileLanguageInput!) {
    addProfileLanguage(language: $language) {
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
