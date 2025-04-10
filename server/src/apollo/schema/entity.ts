import { gql } from 'apollo-server-express';

export const entity = gql`
  """
  Entity Management System Types
  """
  
  type EntityType {
    id: UUID!
    displayName: String!
    parentCategory: String
    isFilterable: Boolean
    createdAt: Timestamp
    updatedAt: Timestamp
    settings: [EntitySetting]
    entities(filter: EntityFilter, limit: Int, offset: Int): [Entity]
  }

  type EntitySetting {
    id: UUID!
    entityTypeId: UUID!
    settingKey: String!
    settingValue: String
    createdAt: Timestamp
    updatedAt: Timestamp
  }

  type Entity {
    id: UUID!
    entityTypeId: UUID!
    type: EntityType
    status: EntityStatus
    engagements: [EntityEngagement]
    events: [EntityEvent]
    achievements: [EntityAchievement]
    zones: [EntityZone]
    touchpoints: [EntityTouchpoint]
    managers: [EntityManager]
    photos: [EntityPhoto]
    
    # Dynamic fields based on entity type
    address: Address
    contact: Contact
    opportunity: Opportunity
  }

  type Address {
    id: UUID!
    name: String
    street: String
    addressLine2: String
    city: String
    state: String
    postalCode: String
    status: EntityStatus
    notes: String
    propertyCondition: JSONB
    nextKnockDate: Timestamp
    streetId: UUID
    neighborhoodId: UUID
    createdBy: UUID
    createdAt: Timestamp
    updatedAt: Timestamp
    locationGeo: Geography
    contacts: [Contact]
    opportunities: [Opportunity]
  }

  type Contact {
    id: UUID!
    firstName: String
    lastName: String
    email: String
    notes: String
    facebook: String
    x: String
    instagram: String
    linkedin: String
    coverPhoto: String
    status: EntityStatus
    contactApproval: Boolean
    contactTypeId: UUID
    contactType: ContactType
    createdBy: UUID
    updatedBy: UUID
    createdAt: Timestamp
    updatedAt: Timestamp
    addresses: [Address]
    opportunities: [Opportunity]
  }

  type ContactType {
    id: UUID!
    type: String
    description: String
    active: Boolean
    createdAt: Timestamp
    updatedAt: Timestamp
  }

  type Opportunity {
    id: UUID!
    opportunityTypeId: UUID!
    opportunityType: OpportunityType
    status: EntityStatus
    notes: String
    createdBy: UUID
    createdAt: Timestamp
    updatedAt: Timestamp
    contacts: [Contact]
    addresses: [Address]
    estimates: [Estimate]
  }

  type OpportunityType {
    id: UUID!
    name: String!
    description: String
    isActive: Boolean
    createdAt: Timestamp
    updatedAt: Timestamp
  }

  input EntityFilter {
    entityTypeIds: [UUID]
    status: [EntityStatus]
    zoneIds: [UUID]
    userIds: [UUID]
    touchpointStatus: TouchpointStatus
    search: String
    dateRange: DateRangeInput
  }
  
  input DateRangeInput {
    startDate: Timestamp
    endDate: Timestamp
  }

  # Entity Management Queries
  extend type Query {
    entityTypes: [EntityType!]!
    entityType(id: UUID!): EntityType
    
    entities(filter: EntityFilter, limit: Int, offset: Int): [Entity!]!
    entity(id: UUID!): Entity
    
    addresses(filter: EntityFilter, limit: Int, offset: Int): [Address!]!
    address(id: UUID!): Address
    
    contacts(filter: EntityFilter, limit: Int, offset: Int): [Contact!]!
    contact(id: UUID!): Contact
    
    opportunities(filter: EntityFilter, limit: Int, offset: Int): [Opportunity!]!
    opportunity(id: UUID!): Opportunity
  }

  # Entity Management Mutations
  extend type Mutation {
    createEntity(input: CreateEntityInput!): Entity!
    updateEntity(id: UUID!, input: UpdateEntityInput!): Entity!
    archiveEntity(id: UUID!): Entity!
    
    createAddress(input: CreateAddressInput!): Address!
    updateAddress(id: UUID!, input: UpdateAddressInput!): Address!
    
    createContact(input: CreateContactInput!): Contact!
    updateContact(id: UUID!, input: UpdateContactInput!): Contact!
    
    createOpportunity(input: CreateOpportunityInput!): Opportunity!
    updateOpportunity(id: UUID!, input: UpdateOpportunityInput!): Opportunity!
  }

  # Input types
  input CreateEntityInput {
    entityTypeId: UUID!
    status: EntityStatus
  }

  input UpdateEntityInput {
    status: EntityStatus
  }

  input CreateAddressInput {
    name: String
    street: String!
    addressLine2: String
    city: String!
    state: String!
    postalCode: String!
    notes: String
    propertyCondition: JSONB
    nextKnockDate: Timestamp
    streetId: UUID
    neighborhoodId: UUID
  }

  input UpdateAddressInput {
    name: String
    street: String
    addressLine2: String
    city: String
    state: String
    postalCode: String
    status: EntityStatus
    notes: String
    propertyCondition: JSONB
    nextKnockDate: Timestamp
    streetId: UUID
    neighborhoodId: UUID
  }

  input CreateContactInput {
    firstName: String!
    lastName: String!
    email: String
    notes: String
    facebook: String
    x: String
    instagram: String
    linkedin: String
    coverPhoto: String
    contactApproval: Boolean
    contactTypeId: UUID
  }

  input UpdateContactInput {
    firstName: String
    lastName: String
    email: String
    notes: String
    facebook: String
    x: String
    instagram: String
    linkedin: String
    coverPhoto: String
    status: EntityStatus
    contactApproval: Boolean
    contactTypeId: UUID
  }

  input CreateOpportunityInput {
    opportunityTypeId: UUID!
    notes: String
  }

  input UpdateOpportunityInput {
    opportunityTypeId: UUID
    status: EntityStatus
    notes: String
  }
`;