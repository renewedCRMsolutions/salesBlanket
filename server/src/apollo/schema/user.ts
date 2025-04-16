import { gql } from 'apollo-server-express';

export const user = gql`
  # User System Types
  type User {
    id: UUID!
    email: String!
    firstName: String
    lastName: String
    isActive: Boolean!
    settings: JSONB
    createdAt: Timestamp!
    updatedAt: Timestamp!
    
    # Relationships
    engagementRoles: [UserEngagementRoleAssignment!]
  }

  # User System Queries
  extend type Query {
    me: User
    users(isActive: Boolean): [User!]!
    user(id: UUID!): User
  }

  # User System Mutations
  extend type Mutation {
    updateUserSettings(id: UUID!, settings: JSONB!): User!
  }
`;