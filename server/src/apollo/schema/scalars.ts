import { gql } from 'apollo-server-express';

export const scalars = gql`
  """
  Custom scalar types for specialized data
  """
  
  "UUID type for database IDs"
  scalar UUID
  
  "Timestamp type for date/time values with timezone"
  scalar Timestamp
  
  "Date type for calendar date values without time"
  scalar Date
  
  "Geography type for PostGIS geography data"
  scalar Geography
  
  "Geometry type for PostGIS geometry data"
  scalar Geometry
  
  "JSON scalar type for unstructured JSON data"
  scalar JSON
  
  "JSONB scalar type for binary JSON data"
  scalar JSONB
`;