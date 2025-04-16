import { scalarResolvers } from './scalars';
import { userResolvers } from './user';
import { zoneResolvers } from './zone';
import { salesTrackResolvers } from './salesTrack';
import { entityResolvers } from './entity';

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
  ...salesTrackResolvers,
  ...entityResolvers,
  ...emptyResolvers
};