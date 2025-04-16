import { gql } from 'apollo-server-express';

export const salesTrack = gql`
  # Sales Track System Types
  
  type SalesTrack {
    id: UUID!
    name: String!
    description: String
    icon: String
    color: String
    isActive: Boolean
    conditionsConfig: JSONB
    entityTypeId: UUID
    entityType: EntityType
    settings: JSONB
    createdAt: Timestamp
    updatedAt: Timestamp
    drives: [SalesDrive]
    departments: [SalesTrackDepartment]
  }
  
  type SalesTrackType {
    id: UUID!
    name: String!
    description: String
    settings: JSONB
    createdAt: Timestamp
    updatedAt: Timestamp
    tracks: [SalesTrack]
  }
  
  type SalesDrive {
    id: UUID!
    salesTrackId: UUID!
    name: String!
    description: String
    icon: String
    color: String
    isActive: Boolean
    startDate: Date
    endDate: Date
    settings: JSONB
    createdAt: Timestamp
    updatedAt: Timestamp
    track: SalesTrack
    stops: [SalesStop]
  }
  
  type SalesStop {
    id: UUID!
    salesDriveId: UUID!
    stopTypeId: UUID
    name: String!
    description: String
    isActive: Boolean
    displayOrder: Int
    color: String
    icon: String
    isArchived: Boolean
    metadata: JSONB
    createdAt: Timestamp
    updatedAt: Timestamp
    drive: SalesDrive
    type: SalesStopType
    entities(filter: EntityFilter, limit: Int, offset: Int): [Entity]
    entityCount: Int
  }
  
  type SalesStopType {
    id: UUID!
    name: String!
    description: String
    isActive: Boolean
    color: String
    settings: JSONB
    createdAt: Timestamp
    updatedAt: Timestamp
    stops: [SalesStop]
  }
  
  type TouchpointType {
    id: UUID!
    name: String!
    description: String
    icon: String
    color: String
    defaultFollowUpDays: Int
    isActive: Boolean
    requiresTask: Boolean
    noShow: Boolean
    displayConfig: JSONB
    isTeamVisible: Boolean
    settings: JSONB
    createdAt: Timestamp
    updatedAt: Timestamp
    touchpoints: [EntityTouchpoint]
  }
  
  # This extends the placeholder from base schema
  type EntityTouchpoint {
    id: UUID!
    entityId: String
    entityTypeId: UUID
    touchpointCodeId: UUID
    notes: String
    status: String
    createdBy: UUID
    createdAt: Timestamp
    updatedAt: Timestamp
    entity: Entity
    touchpointCode: TouchpointCode
    createdByUser: User
  }
  
  type TouchpointCode {
    id: UUID!
    stopTypeId: UUID
    code: String!
    description: String
    isActive: Boolean
    color: String
    icon: String
    metadata: JSONB
    createdAt: Timestamp
    updatedAt: Timestamp
    stopType: SalesStopType
    touchpoints: [EntityTouchpoint]
  }
  
  type SalesTrackDepartment {
    id: UUID!
    salesTrackId: UUID!
    departmentId: UUID!
    metadata: JSONB
    createdAt: Timestamp
    updatedAt: Timestamp
    track: SalesTrack
    department: DepartmentType
  }
  
  # Input Types
  input SalesTrackFilter {
    ids: [UUID]
    entityTypeIds: [UUID]
    isActive: Boolean
    departmentIds: [UUID]
    search: String
  }
  
  input SalesDriveFilter {
    trackIds: [UUID]
    isActive: Boolean
    search: String
    dateRange: DateRangeInput
  }
  
  input SalesStopFilter {
    driveIds: [UUID]
    stopTypeIds: [UUID]
    isActive: Boolean
    search: String
  }
  
  input TouchpointFilter {
    entityId: String
    entityTypeId: UUID
    touchpointCodeIds: [UUID]
    createdBy: UUID
    dateRange: DateRangeInput
  }
  
  input CreateSalesTrackInput {
    name: String!
    description: String
    icon: String
    color: String
    conditionsConfig: JSONB
    entityTypeId: UUID
    settings: JSONB
  }
  
  input UpdateSalesTrackInput {
    name: String
    description: String
    icon: String
    color: String
    isActive: Boolean
    conditionsConfig: JSONB
    entityTypeId: UUID
    settings: JSONB
  }
  
  input CreateSalesDriveInput {
    salesTrackId: UUID!
    name: String!
    description: String
    icon: String
    color: String
    startDate: Date
    endDate: Date
    settings: JSONB
  }
  
  input UpdateSalesDriveInput {
    name: String
    description: String
    icon: String
    color: String
    isActive: Boolean
    startDate: Date
    endDate: Date
    settings: JSONB
  }
  
  input CreateSalesStopInput {
    salesDriveId: UUID!
    stopTypeId: UUID
    name: String!
    description: String
    displayOrder: Int
    color: String
    icon: String
    metadata: JSONB
  }
  
  input UpdateSalesStopInput {
    name: String
    description: String
    isActive: Boolean
    displayOrder: Int
    color: String
    icon: String
    isArchived: Boolean
    metadata: JSONB
  }
  
  input CreateTouchpointInput {
    entityId: String!
    entityTypeId: UUID!
    touchpointCodeId: UUID!
    notes: String
    status: String
  }
  
  input MoveEntityInput {
    entityId: String!
    entityTypeId: UUID!
    fromStopId: UUID!
    toStopId: UUID!
    touchpointCodeId: UUID
    notes: String
  }
  
  # Queries
  extend type Query {
    # Sales Track
    salesTracks(filter: SalesTrackFilter, limit: Int, offset: Int): [SalesTrack!]!
    salesTrack(id: UUID!): SalesTrack
    
    # Sales Drive
    salesDrives(filter: SalesDriveFilter, limit: Int, offset: Int): [SalesDrive!]!
    salesDrive(id: UUID!): SalesDrive
    
    # Sales Stop
    salesStops(filter: SalesStopFilter, limit: Int, offset: Int): [SalesStop!]!
    salesStop(id: UUID!): SalesStop
    
    # Stop Entities
    salesStopEntities(stopId: UUID!, filter: EntityFilter, limit: Int, offset: Int): [Entity!]!
    
    # Touchpoints
    touchpointTypes: [TouchpointType!]!
    touchpointCodes(stopTypeId: UUID): [TouchpointCode!]!
    entityTouchpoints(filter: TouchpointFilter, limit: Int, offset: Int): [EntityTouchpoint!]!
    entityTouchpointHistory(entityId: String!, entityTypeId: UUID!): [EntityTouchpoint!]!
  }
  
  # Mutations
  extend type Mutation {
    # Sales Track
    createSalesTrack(input: CreateSalesTrackInput!): SalesTrack!
    updateSalesTrack(id: UUID!, input: UpdateSalesTrackInput!): SalesTrack!
    
    # Sales Drive
    createSalesDrive(input: CreateSalesDriveInput!): SalesDrive!
    updateSalesDrive(id: UUID!, input: UpdateSalesDriveInput!): SalesDrive!
    
    # Sales Stop
    createSalesStop(input: CreateSalesStopInput!): SalesStop!
    updateSalesStop(id: UUID!, input: UpdateSalesStopInput!): SalesStop!
    
    # Entity management in Stops
    moveEntity(input: MoveEntityInput!): EntityTouchpoint!
    
    # Touchpoints
    createTouchpoint(input: CreateTouchpointInput!): EntityTouchpoint!
  }
`;