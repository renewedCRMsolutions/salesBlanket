import { gql } from 'apollo-server-express';

export const scalars = gql`
  """
  Custom scalar types for specialized data
  """
  
  scalar UUID
  
  scalar Timestamp
  
  scalar Date
  
  scalar Geography
  
  scalar Geometry
  
  scalar JSON
  
  scalar JSONB
`;