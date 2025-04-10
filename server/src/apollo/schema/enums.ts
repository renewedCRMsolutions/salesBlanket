import { gql } from 'apollo-server-express';

export const enums = gql`
  """
  Enumeration types for the GraphQL schema
  """
  
  enum EntityStatus {
    ACTIVE
    INACTIVE
    PENDING
    ARCHIVED
    DELETED
  }
  
  enum TouchpointStatus {
    SCHEDULED
    COMPLETED
    CANCELED
    NO_SHOW
    RESCHEDULED
  }
`;