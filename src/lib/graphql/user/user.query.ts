import { gql, type TypedDocumentNode } from "@apollo/client";
import type { User } from "cv-graphql";

type UserData = {
  user: User;
};

type UserVars = {
  userId: number;
};

export const USER_QUERY: TypedDocumentNode<UserData, UserVars> = gql`
  query User($userId: ID!) {
    user(userId: $userId) {
      id
      created_at
      email
      is_verified
      role
      department_name
      position_name
      profile {
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
      cvs {
        id
        created_at
        name
        education
        description
      }
      department {
        id
        created_at
        name
      }
      position {
        id
        created_at
        name
      }
    }
  }
`;
