import { gql } from 'apollo-server-express';

export const collection = gql`
  # Collection System Types
  type Collection {
    id: UUID!
    name: String!
    status: EntityStatus!
    metadata: JSONB
    filterCriteria: JSONB
    createdBy: UUID!
    createdAt: Timestamp!
    updatedAt: Timestamp!
    
    # Relationships
    addresses: [Address!]
    contacts: [Contact!]
    opportunities: [Opportunity!]
    contactRoles: [CollectionContactRole!]
    pulseItems: [CollectionPulse!]
  }

  type CollectionContactRole {
    id: UUID!
    collectionId: UUID!
    contactId: UUID!
    roleType: CollectionContactRoleType!
    createdAt: Timestamp!
    
    # Relationships
    collection: Collection!
    contact: Contact!
  }

  type CollectionPulse {
    id: UUID!
    collectionId: UUID!
    pulseType: PulseType!
    status: EntityStatus!
    content: JSONB
    lastSynced: Timestamp
    metadata: JSONB
    createdAt: Timestamp!
    updatedAt: Timestamp!
    
    # Relationships
    collection: Collection!
    photos: [PulsePhoto!]
    documents: [PulseDocument!]
    emails: [PulseEmail!]
    tasks: [PulseTask!]
    calendar: [PulseCalendar!]
  }

  type PulsePhoto {
    id: UUID!
    pulseId: UUID!
    googleDriveFileId: String!
    fileName: String!
    mimeType: String!
    thumbnailUrl: String
    metadata: JSONB
    status: EntityStatus!
    createdAt: Timestamp!
    updatedAt: Timestamp!
    
    # Relationships
    pulse: CollectionPulse!
  }

  type PulseDocument {
    id: UUID!
    pulseId: UUID!
    googleDriveFileId: String!
    fileName: String!
    mimeType: String!
    documentType: DocumentType!
    metadata: JSONB
    status: EntityStatus!
    createdAt: Timestamp!
    updatedAt: Timestamp!
    
    # Relationships
    pulse: CollectionPulse!
  }

  type PulseEmail {
    id: UUID!
    pulseId: UUID!
    googleEmailId: String!
    subject: String!
    sender: String!
    recipients: [String!]!
    body: String
    hasAttachments: Boolean!
    metadata: JSONB
    status: EntityStatus!
    createdAt: Timestamp!
    updatedAt: Timestamp!
    
    # Relationships
    pulse: CollectionPulse!
    attachments: [PulseEmailAttachment!]
  }

  type PulseEmailAttachment {
    id: UUID!
    emailId: UUID!
    googleDriveFileId: String
    fileName: String!
    mimeType: String!
    size: Int
    status: EntityStatus!
    createdAt: Timestamp!
    updatedAt: Timestamp!
    
    # Relationships
    email: PulseEmail!
  }

  type PulseTask {
    id: UUID!
    pulseId: UUID!
    googleTaskId: String
    title: String!
    description: String
    dueDate: Timestamp
    completed: Boolean!
    assignedTo: UUID
    metadata: JSONB
    status: EntityStatus!
    createdAt: Timestamp!
    updatedAt: Timestamp!
    
    # Relationships
    pulse: CollectionPulse!
    assignee: User
  }

  type PulseCalendar {
    id: UUID!
    pulseId: UUID!
    googleEventId: String
    title: String!
    description: String
    startTime: Timestamp!
    endTime: Timestamp!
    location: String
    attendees: [String!]
    metadata: JSONB
    status: EntityStatus!
    createdAt: Timestamp!
    updatedAt: Timestamp!
    
    # Relationships
    pulse: CollectionPulse!
  }

  # Collection Queries
  extend type Query {
    collections(filter: CollectionFilter, limit: Int, offset: Int): [Collection!]!
    collection(id: UUID!): Collection
    
    # Search collections
    searchCollections(term: String!, limit: Int): [Collection!]!
    collectionByAddressId(addressId: UUID!): Collection
    collectionByContactId(contactId: UUID!): Collection
    
    # Pulse System Queries
    pulseItems(collectionId: UUID!, types: [PulseType!]): [CollectionPulse!]!
    pulseItem(id: UUID!): CollectionPulse
    
    pulsePhotos(pulseId: UUID!, limit: Int, offset: Int): [PulsePhoto!]!
    pulseDocuments(pulseId: UUID!, limit: Int, offset: Int): [PulseDocument!]!
    pulseEmails(pulseId: UUID!, limit: Int, offset: Int): [PulseEmail!]!
    pulseTasks(pulseId: UUID!, limit: Int, offset: Int): [PulseTask!]!
    pulseCalendar(pulseId: UUID!, limit: Int, offset: Int): [PulseCalendar!]!
  }

  # Collection Mutations
  extend type Mutation {
    # Collection Management
    createCollection(input: CreateCollectionInput!): Collection!
    updateCollection(id: UUID!, input: UpdateCollectionInput!): Collection!
    
    # Entity Creation with Collection
    createAddressWithCollection(input: CreateAddressCollectionInput!): CollectionResult!
    createContactWithCollection(input: CreateContactCollectionInput!): CollectionResult!
    
    # Add entities to existing collection
    addAddressToCollection(collectionId: UUID!, input: CreateAddressInput!): Address!
    addContactToCollection(collectionId: UUID!, input: CreateContactInput!): Contact!
    addOpportunityToCollection(collectionId: UUID!, input: CreateOpportunityInput!): Opportunity!
    
    # Combined operations
    addContactAndOpportunity(
      collectionId: UUID!, 
      contactInput: CreateContactInput!, 
      opportunityInput: CreateOpportunityInput!
    ): ContactOpportunityResult!
    
    # Collection Role Management
    setCollectionContactRole(
      collectionId: UUID!,
      contactId: UUID!,
      roleType: CollectionContactRoleType!
    ): CollectionContactRole!
    
    # Pulse System
    createPulseItem(input: CreatePulseItemInput!): CollectionPulse!
    uploadPulsePhoto(input: UploadPulsePhotoInput!): PulsePhoto!
    uploadPulseDocument(input: UploadPulseDocumentInput!): PulseDocument!
    
    # Google Integration
    syncCollectionWithGoogleDrive(collectionId: UUID!): Boolean!
    processPulseEmail(input: ProcessPulseEmailInput!): PulseEmail!
    createPulseTask(input: CreatePulseTaskInput!): PulseTask!
    createPulseCalendarEvent(input: CreatePulseCalendarInput!): PulseCalendar!
  }

  # Input Types
  input CollectionFilter {
    status: [EntityStatus!]
    search: String
    dateRange: DateRangeInput
    createdBy: UUID
  }

  input CreateCollectionInput {
    name: String!
    status: EntityStatus
    metadata: JSONB
    filterCriteria: JSONB
  }

  input UpdateCollectionInput {
    name: String
    status: EntityStatus
    metadata: JSONB
    filterCriteria: JSONB
  }

  input CreateAddressCollectionInput {
    address: CreateAddressInput!
    addressTypeId: UUID!
    contact: CreateContactInput
    contactTypeId: UUID
    opportunityType: UUID
    collectionName: String
  }
  
  input CreateContactCollectionInput {
    contact: CreateContactInput!
    contactTypeId: UUID!
    address: CreateAddressInput
    addressTypeId: UUID
    opportunityType: UUID
    collectionName: String
  }

  input CreatePulseItemInput {
    collectionId: UUID!
    pulseType: PulseType!
    content: JSONB
    metadata: JSONB
  }

  input UploadPulsePhotoInput {
    pulseId: UUID!
    file: Upload!
    metadata: JSONB
  }

  input UploadPulseDocumentInput {
    pulseId: UUID!
    file: Upload!
    documentType: DocumentType!
    metadata: JSONB
  }

  input ProcessPulseEmailInput {
    collectionId: UUID!
    googleEmailId: String!
    processAttachments: Boolean
  }

  input CreatePulseTaskInput {
    pulseId: UUID!
    title: String!
    description: String
    dueDate: Timestamp
    assignedTo: UUID
    metadata: JSONB
  }

  input CreatePulseCalendarInput {
    pulseId: UUID!
    title: String!
    description: String
    startTime: Timestamp!
    endTime: Timestamp!
    location: String
    attendees: [String!]
    metadata: JSONB
  }
  
  # Result Types
  type CollectionResult {
    collection: Collection!
    address: Address
    contact: Contact
    opportunity: Opportunity
  }
  
  type ContactOpportunityResult {
    contact: Contact!
    opportunity: Opportunity!
  }
`;