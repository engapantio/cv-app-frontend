import { gql, type TypedDocumentNode } from "@apollo/client";
import type { ForgotPasswordInput } from "cv-graphql";

type ForgotPasswordVars = {
  auth: ForgotPasswordInput;
};

export const FORGOT_PASSWORD_MUTATION: TypedDocumentNode<
  { forgotPassword: void },
  ForgotPasswordVars
> = gql`
  mutation ForgotPassword($auth: ForgotPasswordInput!) {
    forgotPassword(auth: $auth)
  }
`;
