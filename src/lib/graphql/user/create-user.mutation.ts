import { gql, type TypedDocumentNode } from "@apollo/client";
import type { CreateUserInput, User } from "cv-graphql";

type CreateUserMutation = {
  createUser: User;
};

type CreateUserMutationVariables = {
  user: CreateUserInput;
};

export const CREATE_USER_MUTATION: TypedDocumentNode<
  CreateUserMutation,
  CreateUserMutationVariables
> = gql`
  mutation CreateUser($user: CreateUserInput!) {
    createUser(user: $user) {
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
