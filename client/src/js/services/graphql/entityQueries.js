/**
 * entityQueries.js
 * 
 * GraphQL queries and mutations for entity management
 */

// Query to get creatable parent entities
export const GET_CREATABLE_PARENT_ENTITIES = `
  query GetCreatableParentEntities {
    creatableParentEntities {
      id
      displayName
      parentCategory
    }
  }
`;

// Query to get entity types by parent
export const GET_ENTITY_TYPES_BY_PARENT = `
  query GetEntityTypesByParent($parentId: UUID!) {
    entityTypesByParent(parentId: $parentId) {
      id
      displayName
    }
  }
`;

// Query to get entity subtypes by type
export const GET_ENTITY_SUBTYPES_BY_TYPE = `
  query GetEntitySubtypesByType($typeId: UUID!) {
    entitySubtypesByType(typeId: $typeId) {
      id
      name
      description
      isActive
    }
  }
`;

// Query to get form by subtype
export const GET_FORM_BY_SUBTYPE = `
  query GetFormBySubtype($subtypeId: UUID!) {
    formBySubtype(subtypeId: $subtypeId) {
      id
      title
      description
      entitySubtypeId
      isActive
      fields {
        id
        fieldName
        displayName
        fieldType
        isRequired
        validationRules
        defaultValue
        options
        displayOrder
      }
    }
  }
`;

// Mutation to create address
export const CREATE_ADDRESS = `
  mutation CreateAddress($input: CreateAddressInput!) {
    createAddress(input: $input) {
      id
      street
      city
      state
      postalCode
    }
  }
`;

// Mutation to create contact
export const CREATE_CONTACT = `
  mutation CreateContact($input: CreateContactInput!) {
    createContact(input: $input) {
      id
      firstName
      lastName
      email
    }
  }
`;

// Mutation to create opportunity
export const CREATE_OPPORTUNITY = `
  mutation CreateOpportunity($input: CreateOpportunityInput!) {
    createOpportunity(input: $input) {
      id
      opportunityType {
        name
      }
    }
  }
`;