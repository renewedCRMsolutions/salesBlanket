import { gql } from 'apollo-server-express';

// Import type definitions
import { scalars } from './scalars';
import { enums } from './enums';
import { entity } from './entity';
import { zone } from './zone';
import { view } from './view';
import { user } from './user';
import { card } from './card';
import { touchpoint } from './touchpoint';
import { goal } from './goal';
import { team } from './team';
import { notification } from './notification';
import { document } from './document';
import { estimate } from './estimate';
import { corporate } from './corporate';

// Base schema with empty Query and Mutation types
const baseTypeDefs = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  type Subscription {
    _empty: String
  }
`;

// Export combined type definitions
export const typeDefs = [
  baseTypeDefs,
  scalars,
  enums,
  entity,
  zone,
  view,
  user,
  card,
  touchpoint,
  goal,
  team,
  notification,
  document,
  estimate,
  corporate
];