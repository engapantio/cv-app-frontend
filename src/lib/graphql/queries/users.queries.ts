import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query GetUsers {
    users {
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
      department_name
      position_name
    }
  }
`;
