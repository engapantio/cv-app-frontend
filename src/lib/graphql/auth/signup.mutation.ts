import { gql, type TypedDocumentNode } from "@apollo/client";
import type { AuthInput, AuthResult } from "cv-graphql";

type SignupData = {
  signup: AuthResult;
};

type SignupVars = {
  auth: AuthInput;
};

export const SIGNUP_MUTATION: TypedDocumentNode<SignupData, SignupVars> = gql`
  mutation Signup($auth: AuthInput!) {
    signup(auth: $auth) {
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
