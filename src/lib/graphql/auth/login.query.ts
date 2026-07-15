import { gql, type TypedDocumentNode } from "@apollo/client";
import type { AuthInput, AuthResult } from "cv-graphql";

type LoginData = {
  login: AuthResult;
};

type LoginVars = {
  auth: AuthInput;
};

export const LOGIN_QUERY: TypedDocumentNode<LoginData, LoginVars> = gql`
  query Login($auth: AuthInput!) {
    login(auth: $auth) {
      user {
        id
        created_at
        email
        is_verified
        profile {
          id
        }
        cvs {
          id
        }
        department {
          id
        }
        department_name
        position {
          id
        }
        position_name
        role
      }
      access_token
      refresh_token
    }
  }
`;