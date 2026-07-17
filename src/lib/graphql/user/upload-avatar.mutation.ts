import { gql, type TypedDocumentNode } from "@apollo/client";
import type { UploadAvatarInput } from "cv-graphql";

type UploadAvatarMutation = {
  uploadAvatar: string;
};

type UploadAvatarMutationVariables = {
  avatar: UploadAvatarInput;
};

export const UPLOAD_AVATAR_MUTATION: TypedDocumentNode<
  UploadAvatarMutation,
  UploadAvatarMutationVariables
> = gql`
  mutation UploadAvatar($avatar: UploadAvatarInput!) {
    uploadAvatar(avatar: $avatar) {
      avatar
    }
  }
`;
