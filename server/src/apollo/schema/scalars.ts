import { gql } from 'apollo-server-express';

export const scalars = gql`
  # Custom Scalar Types
  scalar UUID
  scalar JSONB
  scalar Timestamp
  scalar Geography
  scalar Upload
`;