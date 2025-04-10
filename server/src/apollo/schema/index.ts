import { gql } from 'apollo-server-express';

// Import type definitions
import { scalars } from './scalars';
import { enums } from './enums';
import { entity } from './entity';
import { zone } from './zone';
import { view } from './view';
import { user } from './user';

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

  # Referenced types that are used but not yet fully implemented
  type EntityEngagement {
    id: UUID!
    # Placeholder for future implementation
  }

  type EntityEvent {
    id: UUID!
    # Placeholder for future implementation
  }

  type EntityAchievement {
    id: UUID!
    # Placeholder for future implementation
  }

  type EntityManager {
    id: UUID!
    # Placeholder for future implementation
  }

  type EntityPhoto {
    id: UUID!
    # Placeholder for future implementation
  }

  type EntityTouchpoint {
    id: UUID!
    # Placeholder for future implementation
  }

  type DepartmentType {
    id: UUID!
    # Placeholder for future implementation
  }

  type Group {
    id: UUID!
    # Placeholder for future implementation
  }

  type ZoneGoal {
    id: UUID!
    # Placeholder for future implementation
  }

  type NeighborhoodGoal {
    id: UUID!
    # Placeholder for future implementation
  }

  type Estimate {
    id: UUID!
    # Placeholder for future implementation
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
  user
];