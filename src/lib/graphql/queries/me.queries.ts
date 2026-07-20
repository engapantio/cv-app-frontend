import { gql } from "@apollo/client";
import { User } from "cv-graphql";

export interface GetMeResponse {
  user: User;
}

export const GET_ME = gql`
  query GetMe($userId: ID!) {
    user(userId: $userId) {
      id
      email
      role
      profile {
        id
        full_name
        first_name
        last_name
        avatar
      }
    }
  }
`;
