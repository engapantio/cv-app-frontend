import { gql, type TypedDocumentNode } from "@apollo/client";
import type { DeleteAvatarInput } from "cv-graphql";

type DeleteAvatarMutation = {
  deleteAvatar: void;
};

type DeleteAvatarMutationVariables = {
  avatar: DeleteAvatarInput;
};

export const DELETE_AVATAR_MUTATION: TypedDocumentNode<
  DeleteAvatarMutation,
  DeleteAvatarMutationVariables
> = gql`
  mutation DeleteAvatar($avatar: DeleteAvatarInput!) {
    deleteAvatar(avatar: $avatar)
  }
`;
