import { gql } from 'apollo-server-express';

export const view = gql`
  # View System Types
  
  type ViewType {
    id: UUID!
    name: String!
    componentPath: String
    icon: String
    description: String
    defaultConfig: JSONB
    createdAt: Timestamp
    updatedAt: Timestamp
    configurations: [ViewConfiguration]
  }

  type ViewConfiguration {
    id: UUID!
    viewTypeId: UUID!
    viewType: ViewType
    name: String!
    config: JSONB
    isSystem: Boolean
    isDefault: Boolean
    createdBy: UUID
    creator: User
    createdAt: Timestamp
    updatedAt: Timestamp
    userPreferences: [UserViewPreference]
  }

  type UserViewPreference {
    id: UUID!
    userId: UUID!
    user: User
    viewConfigurationId: UUID!
    viewConfiguration: ViewConfiguration
    isFavorite: Boolean
    customSettings: JSONB
    createdAt: Timestamp
    updatedAt: Timestamp
  }

  type DepartmentView {
    id: UUID!
    departmentId: UUID!
    department: DepartmentType
    name: String!
    description: String
    viewComponents: JSONB
    createdAt: Timestamp
    updatedAt: Timestamp
  }

  type RoleView {
    id: UUID!
    roleId: UUID!
    name: String!
    description: String
    viewComponents: JSONB
    createdAt: Timestamp
    updatedAt: Timestamp
  }

  type GroupView {
    id: UUID!
    groupId: UUID!
    group: Group
    viewConfigurationId: UUID!
    viewConfiguration: ViewConfiguration
    entityTypeId: UUID!
    entityType: EntityType
    orderIndex: Int
    isDefault: Boolean
    createdAt: Timestamp
    updatedAt: Timestamp
  }

  # Input types
  input ViewConfigFilter {
    viewTypeId: UUID
    isSystem: Boolean
    isDefault: Boolean
    search: String
  }

  input CreateViewConfigInput {
    viewTypeId: UUID!
    name: String!
    config: JSONB!
    isSystem: Boolean
    isDefault: Boolean
  }

  input UpdateViewConfigInput {
    viewTypeId: UUID
    name: String
    config: JSONB
    isSystem: Boolean
    isDefault: Boolean
  }

  input SaveUserViewPreferenceInput {
    userId: UUID!
    viewConfigurationId: UUID!
    isFavorite: Boolean
    customSettings: JSONB
  }

  # View System Queries
  extend type Query {
    viewTypes: [ViewType!]!
    viewType(id: UUID!): ViewType
    
    viewConfigurations(filter: ViewConfigFilter, limit: Int, offset: Int): [ViewConfiguration!]!
    viewConfiguration(id: UUID!): ViewConfiguration
    
    userViewPreferences(userId: UUID!): [UserViewPreference!]!
  }

  # View System Mutations
  extend type Mutation {
    createViewConfiguration(input: CreateViewConfigInput!): ViewConfiguration!
    updateViewConfiguration(id: UUID!, input: UpdateViewConfigInput!): ViewConfiguration!
    
    saveUserViewPreference(input: SaveUserViewPreferenceInput!): UserViewPreference!
  }
`;