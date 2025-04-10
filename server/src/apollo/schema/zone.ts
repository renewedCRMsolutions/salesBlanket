import { gql } from 'apollo-server-express';

export const zone = gql`
  # Zone System Types
  
  type ZoneType {
    id: UUID!
    displayName: String!
    levelOrder: Int
    description: String
    icon: String
    defaultColor: String
    defaultOpacity: Float
    defaultLineWidth: Int
    allowedParentTypeIds: [UUID]
    allowedChildTypeIds: [UUID]
    allowBoundaryCrossing: Boolean
    defaultSettings: JSONB
    createdAt: Timestamp
    updatedAt: Timestamp
    zones: [Zone]
  }

  type Zone {
    id: UUID!
    zoneTypeId: UUID!
    zoneType: ZoneType
    parentZoneId: UUID
    parentZone: Zone
    name: String!
    description: String
    status: EntityStatus
    boundary: Geography
    color: String
    opacity: Float
    lineWidth: Int
    settings: JSONB
    metadata: JSONB
    createdAt: Timestamp
    updatedAt: Timestamp
    childZones: [Zone]
    entities: [EntityZone]
    goals: [ZoneGoal]
  }

  type ZoneHierarchy {
    id: UUID!
    parentZoneId: UUID!
    parentZone: Zone
    childZoneId: UUID!
    childZone: Zone
    relationshipType: String
    createdAt: Timestamp
    updatedAt: Timestamp
  }

  type EntityZone {
    id: UUID!
    entityId: String!
    entity: Entity
    zoneId: UUID!
    zone: Zone
    relationshipType: String
    isPrimary: Boolean
    metadata: JSONB
    createdAt: Timestamp
    updatedAt: Timestamp
  }

  type GeographicZone {
    id: UUID!
    parentId: UUID
    parent: GeographicZone
    name: String!
    level: Int
    boundary: Geometry
    googlePlaceId: String
    placeType: String
    metadata: JSONB
    createdAt: Timestamp
    updatedAt: Timestamp
  }

  type Neighborhood {
    id: UUID!
    name: String!
    description: String
    boundaries: Geography
    metadata: JSONB
    createdAt: Timestamp
    updatedAt: Timestamp
    streets: [NeighborhoodStreet]
    goals: [NeighborhoodGoal]
  }

  type NeighborhoodStreet {
    id: UUID!
    neighborhoodId: UUID!
    neighborhood: Neighborhood
    name: String!
    startAddressNumber: Int
    endAddressNumber: Int
    addressParity: String
    geometry: Geography
    metadata: JSONB
    createdAt: Timestamp
    updatedAt: Timestamp
  }

  # Input types
  input ZoneFilter {
    zoneTypeIds: [UUID]
    parentZoneId: UUID
    status: [EntityStatus]
    searchText: String
    boundaryIntersects: Geography
  }

  input NeighborhoodFilter {
    searchText: String
    boundaryIntersects: Geography
  }

  input CreateZoneInput {
    zoneTypeId: UUID!
    parentZoneId: UUID
    name: String!
    description: String
    boundary: Geography
    color: String
    opacity: Float
    lineWidth: Int
    settings: JSONB
    metadata: JSONB
  }

  input UpdateZoneInput {
    zoneTypeId: UUID
    parentZoneId: UUID
    name: String
    description: String
    status: EntityStatus
    boundary: Geography
    color: String
    opacity: Float
    lineWidth: Int
    settings: JSONB
    metadata: JSONB
  }

  input AssignEntityToZoneInput {
    entityId: String!
    zoneId: UUID!
    relationshipType: String
    isPrimary: Boolean
    metadata: JSONB
  }

  # Zone System Queries
  extend type Query {
    zoneTypes: [ZoneType!]!
    zoneType(id: UUID!): ZoneType
    
    zones(filter: ZoneFilter, limit: Int, offset: Int): [Zone!]!
    zone(id: UUID!): Zone
    
    neighborhoods(filter: NeighborhoodFilter, limit: Int, offset: Int): [Neighborhood!]!
    neighborhood(id: UUID!): Neighborhood
  }

  # Zone System Mutations
  extend type Mutation {
    createZone(input: CreateZoneInput!): Zone!
    updateZone(id: UUID!, input: UpdateZoneInput!): Zone!
    
    assignEntityToZone(input: AssignEntityToZoneInput!): EntityZone!
  }
`;