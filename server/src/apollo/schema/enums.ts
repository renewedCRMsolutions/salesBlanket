import { gql } from 'apollo-server-express';

export const enums = gql`
  # Common Enums
  enum EntityStatus {
    ACTIVE
    INACTIVE
    ARCHIVED
    DELETED
    PENDING
  }
  
  enum ViewLevelEnum {
    NONE
    VIEW
    EDIT
    ADMIN
  }
  
  enum EditLevelEnum {
    NONE
    OWN
    GROUP
    ALL
  }
  
  enum DeleteLevelEnum {
    NONE
    OWN
    GROUP
    ALL
  }
  
  enum FormAccessLevel {
    NONE
    VIEW
    EDIT
    ADMIN
  }
  
  enum CollectionContactRoleType {
    DECISION_MAKER
    INFLUENCER
    USER
    BILLING_CONTACT
    TECHNICAL_CONTACT
    OTHER
  }
  
  enum PulseType {
    PHOTO
    DOCUMENT
    EMAIL
    TASK
    CALENDAR
    NOTE
    CHAT
    VIRTUAL_SALES
  }
  
  enum DocumentType {
    CONTRACT
    CLAIM
    ESTIMATE
    PHOTO
    GENERAL
  }
  
  enum TouchpointStatus {
    SCHEDULED
    COMPLETED
    CANCELLED
    MISSED
    RESCHEDULED
  }
`;