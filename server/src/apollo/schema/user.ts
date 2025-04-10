import { gql } from 'apollo-server-express';

export const user = gql`
  """
  User & Permission System Types
  """
  
  type User {
    id: UUID!
    username: String!
    passwordHash: String
    email: String!
    firstName: String
    lastName: String
    status: EntityStatus
    avatarUrl: String
    lastLogin: Timestamp
    createdAt: Timestamp
    updatedAt: Timestamp
    roles: [UserRole]
    settings: [UserSetting]
    engagements: [EntityEngagement]
    viewPreferences: [UserViewPreference]
    zoneScope: [UserZoneScope]
    analytics: [UserAnalytics]
    socialProfiles: [UserSocialProfile]
  }

  type UserRole {
    id: UUID!
    userId: UUID!
    user: User
    roleId: UUID!
    createdAt: Timestamp
  }

  type UserSetting {
    id: UUID!
    userId: UUID!
    user: User
    notificationSettingId: UUID
    value: JSONB
    createdAt: Timestamp
    updatedAt: Timestamp
  }

  type UserZoneScope {
    id: UUID!
    userId: UUID!
    user: User
    zoneId: UUID!
    zone: Zone
    assignedAt: Timestamp
    assignedBy: UUID
    assigner: User
    isActive: Boolean
    createdAt: Timestamp
    updatedAt: Timestamp
  }

  type Permission {
    id: UUID!
    name: String!
    description: String
    resource: String
    action: String
    status: EntityStatus
    entityTypeId: UUID
    entityType: EntityType
    createdAt: Timestamp
    updatedAt: Timestamp
  }

  type RolePermission {
    id: UUID!
    roleId: UUID!
    permissionId: UUID!
    permission: Permission
    createdAt: Timestamp
    activityLogId: UUID
  }

  type UserSocialProfile {
    id: UUID!
    userId: UUID!
    user: User
    provider: String!
    providerId: String!
    email: String
    name: String
    profileUrl: String
    photoUrl: String
    accessToken: String
    refreshToken: String
    tokenExpiry: Timestamp
    createdAt: Timestamp
    updatedAt: Timestamp
  }

  type UserAnalytics {
    id: UUID!
    userId: UUID!
    user: User
    entityId: UUID
    action: String!
    occurredAt: Timestamp
    ipAddress: String
    device: JSONB
    geo: JSONB
    meta: JSONB
    perf: JSONB
    createdAt: Timestamp
  }

  # Authentication
  type AuthPayload {
    token: String!
    user: User!
  }

  type SocialAuthPayload {
    token: String!
    user: User!
    isNewUser: Boolean
  }

  # Input types
  input UserFilter {
    roleIds: [UUID]
    search: String
    status: [EntityStatus]
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
    firstName: String
    lastName: String
  }

  input LoginInput {
    username: String
    email: String
    password: String!
  }

  input SocialLoginInput {
    provider: String!
    token: String!
  }

  # User & Permission Queries
  extend type Query {
    me: User
    user(id: UUID!): User
    users(filter: UserFilter, limit: Int, offset: Int): [User!]!
    
    permissions: [Permission!]!
    permission(id: UUID!): Permission
  }

  # User & Permission Mutations
  extend type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    socialLogin(input: SocialLoginInput!): SocialAuthPayload!
    logout: Boolean!
    
    # Additional user mutations
    updateUserProfile(id: UUID!, input: UpdateUserProfileInput!): User!
    changePassword(currentPassword: String!, newPassword: String!): Boolean!
    requestPasswordReset(email: String!): Boolean!
    resetPassword(token: String!, newPassword: String!): Boolean!
    
    # Role and permission mutations
    assignRoleToUser(userId: UUID!, roleId: UUID!): UserRole!
    removeRoleFromUser(userId: UUID!, roleId: UUID!): Boolean!
    
    # Social profile mutations
    linkSocialProfile(userId: UUID!, input: SocialLoginInput!): UserSocialProfile!
    unlinkSocialProfile(userId: UUID!, provider: String!): Boolean!
  }

  input UpdateUserProfileInput {
    firstName: String
    lastName: String
    email: String
    avatarUrl: String
  }
`;