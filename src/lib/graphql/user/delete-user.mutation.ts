import { gql, type TypedDocumentNode } from "@apollo/client";
import type { DeleteResult } from "cv-graphql";

type DeleteUserMutation = {
  deleteUser: DeleteResult;
};

type DeleteUserMutationVariables = {
  userId: number;
};
export const DELETE_USER_MUTATION: TypedDocumentNode<
  DeleteUserMutation,
  DeleteUserMutationVariables
> = gql`
  mutation DeleteUser($userId: ID!) {
    deleteUser(userId: $userId) {
      affected
    }
  }
`;
