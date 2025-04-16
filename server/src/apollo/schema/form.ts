import { gql } from 'apollo-server-express';

export const form = gql`
  # Form System Types
  type FormDefinition {
    id: UUID!
    name: String!
    description: String
    formSchema: JSONB!
    version: Int!
    isActive: Boolean!
    isPublic: Boolean!
    level: String!
    autoVersioning: Boolean!
    createdBy: UUID
    createdAt: Timestamp!
    updatedAt: Timestamp!
    metadata: JSONB
    
    # Relationships
    mappings: [EntityFormMapping!]
    components: [FormComponent!]
  }

  type FormComponent {
    id: UUID!
    name: String!
    description: String
    componentType: String!
    defaultConfig: JSONB!
    isActive: Boolean!
    isPublic: Boolean!
    organizationId: UUID
    createdBy: UUID
    createdAt: Timestamp!
    updatedAt: Timestamp!
  }

  type EntityFormMapping {
    id: UUID!
    formDefinitionId: UUID!
    
    # Entity identifiers (only one should be non-null)
    entityTypeId: UUID
    addressTypeId: UUID
    contactTypeId: UUID
    entitySubtypeId: UUID
    opportunityTypeId: UUID
    teamEntityId: UUID
    calendarEntityId: UUID
    collectionEntityId: UUID
    geoEntityId: UUID
    laborEntityId: UUID
    notificationEntityId: UUID
    organizationEntityId: UUID
    parentEntityId: UUID
    productionEntityId: UUID
    permissionEntityId: UUID
    salesEngineEntityId: UUID
    
    autoBypassSubtype: Boolean!
    isDefault: Boolean!
    displayOrder: Int!
    createdAt: Timestamp!
    updatedAt: Timestamp!
    
    # Relationships
    formDefinition: FormDefinition!
  }

  type FormSubmission {
    id: UUID!
    formDefinitionId: UUID!
    formVersion: Int!
    entityId: UUID
    entityType: String
    formData: JSONB!
    collectionId: UUID
    submittedBy: UUID!
    submittedAt: Timestamp!
  }

  # Form Lookup Result for client consumption
  type FormMappingResult {
    id: UUID!
    formDefinitionId: UUID!
    entityTypeId: UUID
    addressTypeId: UUID
    contactTypeId: UUID
    entitySubtypeId: UUID
    opportunityTypeId: UUID
    autoBypassSubtype: Boolean!
    isDefault: Boolean!
    displayOrder: Int!
    formName: String!
    formSchema: JSONB!
    formDescription: String
  }
  
  # Form System Queries
  extend type Query {
    # Form Definitions
    formDefinitions(isActive: Boolean): [FormDefinition!]!
    formDefinition(id: UUID!): FormDefinition
    
    # Form Components
    formComponents(isActive: Boolean): [FormComponent!]!
    formComponent(id: UUID!): FormComponent
    
    # Form Mappings Lookup
    lookupFormsByEntityType(
      addressTypeId: UUID,
      contactTypeId: UUID,
      opportunityTypeId: UUID,
      entitySubtypeId: UUID
    ): [FormMappingResult!]!
    
    # Form Submissions
    formSubmissions(entityId: UUID, entityType: String, limit: Int, offset: Int): [FormSubmission!]!
    formSubmission(id: UUID!): FormSubmission
  }

  # Form System Mutations
  extend type Mutation {
    # Form Definitions
    createFormDefinition(input: CreateFormDefinitionInput!): FormDefinition!
    updateFormDefinition(id: UUID!, input: UpdateFormDefinitionInput!): FormDefinition!
    
    # Form Components
    createFormComponent(input: CreateFormComponentInput!): FormComponent!
    updateFormComponent(id: UUID!, input: UpdateFormComponentInput!): FormComponent!
    
    # Form Mappings
    createEntityFormMapping(input: CreateEntityFormMappingInput!): EntityFormMapping!
    updateEntityFormMapping(id: UUID!, input: UpdateEntityFormMappingInput!): EntityFormMapping!
    
    # Form Submissions
    submitForm(input: FormSubmissionInput!): FormSubmissionResult!
  }

  # Input Types
  input CreateFormDefinitionInput {
    name: String!
    description: String
    formSchema: JSONB!
    isActive: Boolean
    isPublic: Boolean
    level: String
    autoVersioning: Boolean
    metadata: JSONB
  }

  input UpdateFormDefinitionInput {
    name: String
    description: String
    formSchema: JSONB
    isActive: Boolean
    isPublic: Boolean
    level: String
    autoVersioning: Boolean
    metadata: JSONB
  }

  input CreateFormComponentInput {
    name: String!
    description: String
    componentType: String!
    defaultConfig: JSONB!
    isActive: Boolean
    isPublic: Boolean
  }

  input UpdateFormComponentInput {
    name: String
    description: String
    componentType: String
    defaultConfig: JSONB
    isActive: Boolean
    isPublic: Boolean
  }

  input CreateEntityFormMappingInput {
    formDefinitionId: UUID!
    entityTypeId: UUID
    addressTypeId: UUID
    contactTypeId: UUID
    entitySubtypeId: UUID
    opportunityTypeId: UUID
    teamEntityId: UUID
    calendarEntityId: UUID
    collectionEntityId: UUID
    geoEntityId: UUID
    laborEntityId: UUID
    notificationEntityId: UUID
    organizationEntityId: UUID
    parentEntityId: UUID
    productionEntityId: UUID
    permissionEntityId: UUID
    salesEngineEntityId: UUID
    autoBypassSubtype: Boolean
    isDefault: Boolean
    displayOrder: Int
  }

  input UpdateEntityFormMappingInput {
    formDefinitionId: UUID
    entityTypeId: UUID
    addressTypeId: UUID
    contactTypeId: UUID
    entitySubtypeId: UUID
    opportunityTypeId: UUID
    teamEntityId: UUID
    calendarEntityId: UUID
    collectionEntityId: UUID
    geoEntityId: UUID
    laborEntityId: UUID
    notificationEntityId: UUID
    organizationEntityId: UUID
    parentEntityId: UUID
    productionEntityId: UUID
    permissionEntityId: UUID
    salesEngineEntityId: UUID
    autoBypassSubtype: Boolean
    isDefault: Boolean
    displayOrder: Int
  }

  input FormSubmissionInput {
    formDefinitionId: UUID!
    formVersion: Int!
    entityId: UUID
    entityType: String
    addressTypeId: UUID
    contactTypeId: UUID
    opportunityTypeId: UUID
    collectionId: UUID
    formData: JSONB!
    createCollection: Boolean
  }

  type FormSubmissionResult {
    success: Boolean!
    entityId: UUID
    entityType: String
    collectionId: UUID
    errors: [String!]
    message: String
  }
`;