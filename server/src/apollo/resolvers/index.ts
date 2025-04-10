import { scalarResolvers } from './scalars';
import { userResolvers } from './user';
import { zoneResolvers } from './zone';

// Define empty resolvers for types that don't have resolver files yet
const emptyResolvers = {
  Query: {},
  Mutation: {}
};

// Merge all resolvers
export const resolvers = {
  ...scalarResolvers,
  ...userResolvers,
  ...zoneResolvers,
  ...emptyResolvers
};