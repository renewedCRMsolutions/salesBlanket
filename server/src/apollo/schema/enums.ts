import { gql } from 'apollo-server-express';

export const enums = gql`
  """
  Enumeration types for the GraphQL schema
  """
  
  "Entity status values"
  enum EntityStatus {
    ACTIVE
    INACTIVE
    PENDING
    ARCHIVED
    DELETED
  }
  
  "Touchpoint status values"
  enum TouchpointStatus {
    SCHEDULED
    COMPLETED
    CANCELED
    NO_SHOW
    RESCHEDULED
  }
`;