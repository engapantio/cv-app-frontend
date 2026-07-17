import { gql, type TypedDocumentNode } from "@apollo/client";
import type { Profile } from "cv-graphql";

type ProfileQuery = {
  profile: Profile;
};

type ProfileQueryVariables = {
  userId: number;
};

export const PROFILE_QUERY: TypedDocumentNode<ProfileQuery, ProfileQueryVariables> = gql`
  query Profile($userId: ID!) {
    profile(userId: $userId) {
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
