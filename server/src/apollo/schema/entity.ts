import { gql } from 'apollo-server-express';

export const entity = gql`
  # Entity Management System Types
  
  type EntityType {
    id: UUID!
    displayName: String!
    description: String
    isFilterable: Boolean!
    isActive: Boolean!
    settings: JSONB
    createdAt: Timestamp!
    updatedAt: Timestamp!
    
    # Relationships
    entities(filter: EntityFilter, limit: Int, offset: Int): [Entity]
  }

  type EntitySubtype {
    id: UUID!
    displayName: String!
    description: String
    isActive: Boolean!
    isFilterable: Boolean!
    settings: JSONB
    createdAt: Timestamp!
    updatedAt: Timestamp!
  }

  interface Entity {
    id: UUID!
    type: String!
    status: EntityStatus!
    createdBy: UUID!
    createdAt: Timestamp!
    updatedAt: Timestamp!
  }

  type Address implements Entity {
    id: UUID!
    type: String!
    status: EntityStatus!
    createdBy: UUID!
    createdAt: Timestamp!
    updatedAt: Timestamp!
    
    # Address specific fields
    displayName: String
    street: String!
    addressLine2: String
    city: String
    state: String
    postalCode: String
    notes: String
    propertyCondition: JSONB
    nextKnockDate: Timestamp
    
    # Relationships
    addressType: AddressType
    collection: Collection
    contacts: [Contact!]
    opportunities: [Opportunity!]
    locationGeo: Geography
    metadata: JSONB
  }

  type AddressType {
    id: UUID!
    displayName: String!
    description: String
    isResidential: Boolean
    isCommercial: Boolean
    isActive: Boolean!
    icon: String
    color: String
    orderIndex: Int
    createdAt: Timestamp!
    updatedAt: Timestamp!
    
    # Relationships
    addresses: [Address!]
    formMappings: [EntityFormMapping!]
  }

  type Contact implements Entity {
    id: UUID!
    type: String!
    status: EntityStatus!
    createdBy: UUID!
    createdAt: Timestamp!
    updatedAt: Timestamp!
    
    # Contact specific fields
    firstName: String
    lastName: String
    email: String
    notes: String
    facebook: String
    x: String
    instagram: String
    linkedin: String
    coverPhoto: String
    contactApproval: Boolean
    
    # Relationships
    contactType: ContactType
    collection: Collection
    addresses: [Address!]
    opportunities: [Opportunity!]
    collectionRoles: [CollectionContactRole!]
    metadata: JSONB
  }

  type ContactType {
    id: UUID!
    displayName: String!
    description: String
    active: Boolean!
    settings: JSONB
    createdAt: Timestamp!
    updatedAt: Timestamp!
    
    # Relationships
    contacts: [Contact!]
    formMappings: [EntityFormMapping!]
  }

  type Opportunity implements Entity {
    id: UUID!
    type: String!
    status: EntityStatus!
    createdBy: UUID!
    createdAt: Timestamp!
    updatedAt: Timestamp!
    
    # Opportunity specific fields
    notes: String
    
    # Relationships
    opportunityType: OpportunityType
    collection: Collection
    contacts: [Contact!]
    addresses: [Address!]
    metadata: JSONB
  }

  type OpportunityType {
    id: UUID!
    name: String!
    description: String
    isActive: Boolean!
    settings: JSONB
    createdAt: Timestamp!
    updatedAt: Timestamp!
    
    # Relationships
    opportunities: [Opportunity!]
    formMappings: [EntityFormMapping!]
  }

  # Entity Query Inputs
  input EntityFilter {
    entityTypeIds: [UUID]
    status: [EntityStatus]
    search: String
    dateRange: DateRangeInput
    addressTypeIds: [UUID]
    contactTypeIds: [UUID]
    opportunityTypeIds: [UUID]
    collectionIds: [UUID]
  }
  
  input DateRangeInput {
    startDate: Timestamp
    endDate: Timestamp
  }

  # Entity Management Queries
  extend type Query {
    # Entity Types
    entityTypes(isActive: Boolean): [EntityType!]!
    entityType(id: UUID!): EntityType
    
    entitySubtypes(isActive: Boolean): [EntitySubtype!]!
    entitySubtype(id: UUID!): EntitySubtype
    
    # Address Types
    addressTypes(isActive: Boolean): [AddressType!]!
    addressType(id: UUID!): AddressType
    
    # Contact Types
    contactTypes(isActive: Boolean): [ContactType!]!
    contactType(id: UUID!): ContactType
    
    # Opportunity Types
    opportunityTypes(isActive: Boolean): [OpportunityType!]!
    opportunityType(id: UUID!): OpportunityType
    
    # Entities
    addresses(filter: EntityFilter, limit: Int, offset: Int): [Address!]!
    address(id: UUID!): Address
    
    contacts(filter: EntityFilter, limit: Int, offset: Int): [Contact!]!
    contact(id: UUID!): Contact
    
    opportunities(filter: EntityFilter, limit: Int, offset: Int): [Opportunity!]!
    opportunity(id: UUID!): Opportunity
    
    # Search
    searchContacts(term: String!, limit: Int): [Contact!]!
    searchAddresses(term: String!, limit: Int): [Address!]!
  }

  # Entity Management Mutations
  extend type Mutation {
    # Address Management
    createAddress(input: CreateAddressInput!): Address!
    updateAddress(id: UUID!, input: UpdateAddressInput!): Address!
    
    # Contact Management
    createContact(input: CreateContactInput!): Contact!
    updateContact(id: UUID!, input: UpdateContactInput!): Contact!
    
    # Opportunity Management
    createOpportunity(input: CreateOpportunityInput!): Opportunity!
    updateOpportunity(id: UUID!, input: UpdateOpportunityInput!): Opportunity!
    
    # Entity Status Management
    archiveEntity(id: UUID!, entityType: String!): Boolean!
  }

  # Input types
  input CreateAddressInput {
    displayName: String
    street: String!
    addressLine2: String
    city: String
    state: String
    postalCode: String
    notes: String
    propertyCondition: JSONB
    nextKnockDate: Timestamp
    addressTypeId: UUID!
    collectionId: UUID
    metadata: JSONB
  }

  input UpdateAddressInput {
    displayName: String
    street: String
    addressLine2: String
    city: String
    state: String
    postalCode: String
    status: EntityStatus
    notes: String
    propertyCondition: JSONB
    nextKnockDate: Timestamp
    addressTypeId: UUID
    metadata: JSONB
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
    contactTypeId: UUID!
    collectionId: UUID
    metadata: JSONB
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
    metadata: JSONB
  }

  input CreateOpportunityInput {
    opportunityTypeId: UUID!
    notes: String
    collectionId: UUID!
    metadata: JSONB
  }

  input UpdateOpportunityInput {
    opportunityTypeId: UUID
    status: EntityStatus
    notes: String
    metadata: JSONB
  }
`;