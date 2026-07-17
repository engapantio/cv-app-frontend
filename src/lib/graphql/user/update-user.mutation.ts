import { gql, type TypedDocumentNode } from "@apollo/client";
import type { UpdateUserInput, User } from "cv-graphql";

type UpdateUserMutation = {
  updateUser: User;
};

type UpdateUserMutationVariables = {
  user: UpdateUserInput;
};

export const UPDATE_USER_MUTATION: TypedDocumentNode<
  UpdateUserMutation,
  UpdateUserMutationVariables
> = gql`
  mutation UpdateUser($user: UpdateUserInput!) {
    updateUser(user: $user) {
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
