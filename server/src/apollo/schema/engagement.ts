import { gql } from 'apollo-server-express';

export const engagement = gql`
  # Engagement System Types
  type EngagementRoleType {
    id: UUID!
    name: String!
    description: String
    isActive: Boolean!
    settings: JSONB
    createdAt: Timestamp!
    updatedAt: Timestamp!
    
    # Relationships
    roles: [EngagementRole!]
  }

  type EngagementRole {
    id: UUID!
    name: String!
    description: String
    engagementRoleTypeId: UUID
    appliesToEntityTypes: [String!]
    isActive: Boolean!
    isExternalVisible: Boolean!
    settings: JSONB
    createdAt: Timestamp!
    updatedAt: Timestamp!
    
    # Relationships
    type: EngagementRoleType
    assignments: [UserEngagementRoleAssignment!]
    entityMappings: [EngagementRoleEntityMapping!]
  }

  type EngagementRoleEntityMapping {
    id: UUID!
    engagementRoleId: UUID!
    
    # Entity identifiers
    entityTypeId: UUID
    addressTypeId: UUID
    contactTypeId: UUID
    entitySubtypeId: UUID
    opportunityTypeId: UUID
    teamEntityId: UUID
    calendarEntityId: UUID
    collectionEntityId: UUID
    geoEntityId: UUID
    notificationEntityId: UUID
    organizationEntityId: UUID
    parentEntityId: UUID
    productionEntityId: UUID
    permissionEntityId: UUID
    salesEngineEntityId: UUID
    
    viewLevel: ViewLevelEnum!
    editLevel: EditLevelEnum!
    deleteLevel: DeleteLevelEnum!
    canAssign: Boolean!
    isActive: Boolean!
    displayOrder: Int!
    createdAt: Timestamp!
    updatedAt: Timestamp!
    
    # Relationships
    role: EngagementRole!
  }

  type EntityCreationRoleMapping {
    id: UUID!
    sourceEntityType: String!
    targetEntityType: String!
    engagementRoleId: UUID
    assignmentConditions: JSONB
    assignToCreator: Boolean!
    inheritFromParent: Boolean!
    isActive: Boolean!
    displayOrder: Int!
    createdAt: Timestamp!
    updatedAt: Timestamp!
    
    # Relationships
    role: EngagementRole
  }

  type DefaultRoleUserAssignment {
    id: UUID!
    engagementRoleId: UUID!
    userId: UUID!
    entityType: String!
    assignmentCriteria: JSONB
    isActive: Boolean!
    displayOrder: Int!
    createdAt: Timestamp!
    updatedAt: Timestamp!
    
    # Relationships
    role: EngagementRole!
    user: User!
  }

  type UserEngagementRoleAssignment {
    id: UUID!
    userId: UUID!
    engagementRoleId: UUID!
    entityId: UUID!
    entityTypeName: String!
    assignedBy: UUID
    assignedAt: Timestamp!
    isActive: Boolean!
    createdAt: Timestamp!
    updatedAt: Timestamp!
    
    # Relationships
    user: User!
    role: EngagementRole!
  }

  # Simplified User type for references
  type User {
    id: UUID!
    email: String!
    firstName: String
    lastName: String
    isActive: Boolean!
  }

  # Engagement System Queries
  extend type Query {
    # Role Types
    engagementRoleTypes(isActive: Boolean): [EngagementRoleType!]!
    engagementRoleType(id: UUID!): EngagementRoleType
    
    # Roles
    engagementRoles(isActive: Boolean): [EngagementRole!]!
    engagementRole(id: UUID!): EngagementRole
    
    # Entity Role Mappings
    entityCreationRoleMappings(sourceEntityType: String, targetEntityType: String): [EntityCreationRoleMapping!]!
    
    # Default User Assignments
    defaultRoleUserAssignments(entityType: String): [DefaultRoleUserAssignment!]!
    
    # User Assignments
    userEngagementRoleAssignments(
      userId: UUID, 
      entityId: UUID, 
      entityTypeName: String
    ): [UserEngagementRoleAssignment!]!
    
    # Entity specific queries
    getUsersForEntity(entityId: UUID!, entityType: String!): [UserEngagementRoleAssignment!]!
    getRolesForUser(userId: UUID!): [UserEngagementRoleAssignment!]!
  }

  # Engagement System Mutations
  extend type Mutation {
    # Role Management
    createEngagementRole(input: CreateEngagementRoleInput!): EngagementRole!
    updateEngagementRole(id: UUID!, input: UpdateEngagementRoleInput!): EngagementRole!
    
    # Entity Role Mappings
    createEntityCreationRoleMapping(input: CreateEntityCreationRoleMappingInput!): EntityCreationRoleMapping!
    updateEntityCreationRoleMapping(id: UUID!, input: UpdateEntityCreationRoleMappingInput!): EntityCreationRoleMapping!
    
    # User Role Assignments
    assignUserToEntity(input: AssignUserToEntityInput!): UserEngagementRoleAssignment!
    removeUserFromEntity(id: UUID!): Boolean!
    
    # Default Assignments
    createDefaultRoleUserAssignment(input: CreateDefaultRoleUserAssignmentInput!): DefaultRoleUserAssignment!
    updateDefaultRoleUserAssignment(id: UUID!, input: UpdateDefaultRoleUserAssignmentInput!): DefaultRoleUserAssignment!
  }

  # Input Types
  input CreateEngagementRoleInput {
    name: String!
    description: String
    engagementRoleTypeId: UUID
    appliesToEntityTypes: [String!]
    isActive: Boolean
    isExternalVisible: Boolean
    settings: JSONB
  }

  input UpdateEngagementRoleInput {
    name: String
    description: String
    engagementRoleTypeId: UUID
    appliesToEntityTypes: [String!]
    isActive: Boolean
    isExternalVisible: Boolean
    settings: JSONB
  }

  input CreateEntityCreationRoleMappingInput {
    sourceEntityType: String!
    targetEntityType: String!
    engagementRoleId: UUID!
    assignmentConditions: JSONB
    assignToCreator: Boolean
    inheritFromParent: Boolean
    isActive: Boolean
    displayOrder: Int
  }

  input UpdateEntityCreationRoleMappingInput {
    sourceEntityType: String
    targetEntityType: String
    engagementRoleId: UUID
    assignmentConditions: JSONB
    assignToCreator: Boolean
    inheritFromParent: Boolean
    isActive: Boolean
    displayOrder: Int
  }

  input AssignUserToEntityInput {
    userId: UUID!
    engagementRoleId: UUID!
    entityId: UUID!
    entityTypeName: String!
  }

  input CreateDefaultRoleUserAssignmentInput {
    engagementRoleId: UUID!
    userId: UUID!
    entityType: String!
    assignmentCriteria: JSONB
    isActive: Boolean
    displayOrder: Int
  }

  input UpdateDefaultRoleUserAssignmentInput {
    engagementRoleId: UUID
    userId: UUID
    entityType: String
    assignmentCriteria: JSONB
    isActive: Boolean
    displayOrder: Int
  }
`;