import { mergeResolvers } from '@graphql-tools/merge';
import { scalarResolvers } from './scalars';
import { entityResolvers } from './entity';
import { zoneResolvers } from './zone';
import { viewResolvers } from './view';
import { userResolvers } from './user';
import { cardResolvers } from './card';
import { touchpointResolvers } from './touchpoint';
import { goalResolvers } from './goal';
import { teamResolvers } from './team';
import { notificationResolvers } from './notification';
import { documentResolvers } from './document';
import { estimateResolvers } from './estimate';
import { corporateResolvers } from './corporate';

// Merge all resolvers
export const resolvers = mergeResolvers([
  scalarResolvers,
  entityResolvers,
  zoneResolvers,
  viewResolvers,
  userResolvers,
  cardResolvers,
  touchpointResolvers,
  goalResolvers,
  teamResolvers,
  notificationResolvers,
  documentResolvers,
  estimateResolvers,
  corporateResolvers
]);