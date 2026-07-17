import { gql, type TypedDocumentNode } from "@apollo/client";
import type { ResetPasswordInput } from "cv-graphql";

type ResetPasswordVars = {
  auth: ResetPasswordInput;
};

export const FORGOT_PASSWORD_MUTATION: TypedDocumentNode<
  { resetPassword: void },
  ResetPasswordVars
> = gql`
  mutation ResetPassword($auth: ResetPasswordInput!) {
    resetPassword(auth: $auth)
  }
`;
