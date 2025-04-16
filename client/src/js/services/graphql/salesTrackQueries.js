/**
 * salesTrackQueries.js
 * 
 * GraphQL queries for interacting with the Sales Track system
 */

// Get all sales tracks
export const GET_SALES_TRACKS = `
  query GetSalesTracks($filter: SalesTrackFilter, $limit: Int, $offset: Int) {
    salesTracks(filter: $filter, limit: $limit, offset: $offset) {
      id
      name
      description
      icon
      color
      isActive
      entityTypeId
      entityType {
        id
        displayName
      }
      drives {
        id
        name
      }
    }
  }
`;

// Get a specific sales track with full details
export const GET_SALES_TRACK_DETAILS = `
  query GetSalesTrackDetails($id: UUID!) {
    salesTrack(id: $id) {
      id
      name
      description
      icon
      color
      isActive
      conditionsConfig
      entityTypeId
      entityType {
        id
        displayName
      }
      settings
      createdAt
      updatedAt
      drives {
        id
        name
        description
        icon
        color
        isActive
        startDate
        endDate
        settings
      }
      departments {
        id
        departmentId
      }
    }
  }
`;

// Get all drives for a specific track
export const GET_SALES_DRIVES = `
  query GetSalesDrives($filter: SalesDriveFilter, $limit: Int, $offset: Int) {
    salesDrives(filter: $filter, limit: $limit, offset: $offset) {
      id
      salesTrackId
      name
      description
      icon
      color
      isActive
      startDate
      endDate
      createdAt
      updatedAt
      track {
        id
        name
      }
    }
  }
`;

// Get a specific drive with full details including stops
export const GET_SALES_DRIVE_DETAILS = `
  query GetSalesDriveDetails($id: UUID!) {
    salesDrive(id: $id) {
      id
      salesTrackId
      name
      description
      icon
      color
      isActive
      startDate
      endDate
      settings
      createdAt
      updatedAt
      track {
        id
        name
      }
      stops {
        id
        name
        description
        isActive
        displayOrder
        color
        icon
        isArchived
        entityCount
      }
    }
  }
`;

// Get all stops for a specific drive
export const GET_SALES_STOPS = `
  query GetSalesStops($filter: SalesStopFilter, $limit: Int, $offset: Int) {
    salesStops(filter: $filter, limit: $limit, offset: $offset) {
      id
      salesDriveId
      stopTypeId
      name
      description
      isActive
      displayOrder
      color
      icon
      isArchived
      createdAt
      updatedAt
      drive {
        id
        name
      }
      entityCount
    }
  }
`;

// Get a specific stop with full details
export const GET_SALES_STOP_DETAILS = `
  query GetSalesStopDetails($id: UUID!) {
    salesStop(id: $id) {
      id
      salesDriveId
      stopTypeId
      name
      description
      isActive
      displayOrder
      color
      icon
      isArchived
      metadata
      createdAt
      updatedAt
      drive {
        id
        name
        salesTrackId
        track {
          id
          name
        }
      }
      type {
        id
        name
      }
      entityCount
    }
  }
`;

// Get entities in a stop
export const GET_SALES_STOP_ENTITIES = `
  query GetSalesStopEntities($stopId: UUID!, $filter: EntityFilter, $limit: Int, $offset: Int) {
    salesStopEntities(stopId: $stopId, filter: $filter, limit: $limit, offset: $offset) {
      id
      entityTypeId
      status
      type {
        id
        displayName
      }
      address {
        id
        name
        street
        addressLine2
        city
        state
        postalCode
        nextKnockDate
      }
      contact {
        id
        firstName
        lastName
        email
      }
      opportunity {
        id
        status
        notes
      }
    }
  }
`;

// Get touchpoint types
export const GET_TOUCHPOINT_TYPES = `
  query GetTouchpointTypes {
    touchpointTypes {
      id
      name
      description
      icon
      color
      isActive
    }
  }
`;

// Get touchpoint codes for a stop type
export const GET_TOUCHPOINT_CODES = `
  query GetTouchpointCodes($stopTypeId: UUID) {
    touchpointCodes(stopTypeId: $stopTypeId) {
      id
      code
      description
      color
      icon
      isActive
    }
  }
`;

// Get touchpoint history for an entity
export const GET_ENTITY_TOUCHPOINT_HISTORY = `
  query GetEntityTouchpointHistory($entityId: String!, $entityTypeId: UUID!) {
    entityTouchpointHistory(entityId: $entityId, entityTypeId: $entityTypeId) {
      id
      notes
      status
      createdAt
      touchpointCode {
        id
        code
        description
        color
        icon
      }
      createdByUser {
        id
        firstName
        lastName
      }
    }
  }
`;

// Create a sales track
export const CREATE_SALES_TRACK = `
  mutation CreateSalesTrack($input: CreateSalesTrackInput!) {
    createSalesTrack(input: $input) {
      id
      name
      description
      icon
      color
      entityTypeId
      createdAt
    }
  }
`;

// Update a sales track
export const UPDATE_SALES_TRACK = `
  mutation UpdateSalesTrack($id: UUID!, $input: UpdateSalesTrackInput!) {
    updateSalesTrack(id: $id, input: $input) {
      id
      name
      description
      icon
      color
      isActive
      conditionsConfig
      entityTypeId
      settings
      updatedAt
    }
  }
`;

// Create a sales drive
export const CREATE_SALES_DRIVE = `
  mutation CreateSalesDrive($input: CreateSalesDriveInput!) {
    createSalesDrive(input: $input) {
      id
      salesTrackId
      name
      description
      icon
      color
      startDate
      endDate
      createdAt
    }
  }
`;

// Update a sales drive
export const UPDATE_SALES_DRIVE = `
  mutation UpdateSalesDrive($id: UUID!, $input: UpdateSalesDriveInput!) {
    updateSalesDrive(id: $id, input: $input) {
      id
      name
      description
      icon
      color
      isActive
      startDate
      endDate
      settings
      updatedAt
    }
  }
`;

// Create a sales stop
export const CREATE_SALES_STOP = `
  mutation CreateSalesStop($input: CreateSalesStopInput!) {
    createSalesStop(input: $input) {
      id
      salesDriveId
      stopTypeId
      name
      description
      displayOrder
      color
      icon
      createdAt
    }
  }
`;

// Update a sales stop
export const UPDATE_SALES_STOP = `
  mutation UpdateSalesStop($id: UUID!, $input: UpdateSalesStopInput!) {
    updateSalesStop(id: $id, input: $input) {
      id
      name
      description
      isActive
      displayOrder
      color
      icon
      isArchived
      metadata
      updatedAt
    }
  }
`;

// Move an entity between stops
export const MOVE_ENTITY = `
  mutation MoveEntity($input: MoveEntityInput!) {
    moveEntity(input: $input) {
      id
      entityId
      entityTypeId
      touchpointCodeId
      notes
      createdAt
      touchpointCode {
        id
        code
      }
    }
  }
`;

// Create a touchpoint
export const CREATE_TOUCHPOINT = `
  mutation CreateTouchpoint($input: CreateTouchpointInput!) {
    createTouchpoint(input: $input) {
      id
      entityId
      entityTypeId
      touchpointCodeId
      notes
      status
      createdAt
      touchpointCode {
        id
        code
      }
    }
  }
`;