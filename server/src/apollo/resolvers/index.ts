import { merge } from 'lodash';
import { entityResolvers } from './entity';
import { formResolvers } from './form';
import { collectionResolvers } from './collection';

// Scalar resolvers
const scalarResolvers = {
  UUID: {
    // Basic implementation
    serialize: (value: any) => String(value),
    parseValue: (value: any) => String(value),
    parseLiteral: (ast: any) => ast.value,
  },
  
  JSONB: {
    // Basic implementation
    serialize: (value: any) => value,
    parseValue: (value: any) => value,
    parseLiteral: (ast: any) => ast.value,
  },
  
  Timestamp: {
    // Basic implementation
    serialize: (value: any) => value instanceof Date ? value.toISOString() : value,
    parseValue: (value: any) => typeof value === 'string' ? new Date(value) : value,
    parseLiteral: (ast: any) => ast.value,
  },
  
  Geography: {
    // Basic implementation
    serialize: (value: any) => value,
    parseValue: (value: any) => value,
    parseLiteral: (ast: any) => ast.value,
  },
};

// Merge all resolvers
const resolvers = merge(
  { 
    UUID: scalarResolvers.UUID,
    JSONB: scalarResolvers.JSONB,
    Timestamp: scalarResolvers.Timestamp,
    Geography: scalarResolvers.Geography,
  },
  entityResolvers,
  formResolvers,
  collectionResolvers,
);

export default resolvers;