import { gql, type TypedDocumentNode } from "@apollo/client";
import type { UpdateTokenResult } from "cv-graphql";

type UpdateTokenData = {
  updateToken: UpdateTokenResult;
};

type UpdateTokenVars = Record<string, never>;

export const UPDATE_TOKEN_MUTATION: TypedDocumentNode<
  UpdateTokenData,
  UpdateTokenVars
> = gql`
  mutation UpdateToken {
    updateToken {
      access_token
      refresh_token
    }
  }
`;
