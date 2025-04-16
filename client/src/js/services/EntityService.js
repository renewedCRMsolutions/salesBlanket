/**
 * EntityService.js
 * 
 * Service for entity-related operations.
 * Provides methods for fetching entity types, forms, and creating entities.
 */

import {
  GET_CREATABLE_PARENT_ENTITIES,
  GET_ENTITY_TYPES_BY_PARENT,
  GET_ENTITY_SUBTYPES_BY_TYPE,
  GET_FORM_BY_SUBTYPE,
  CREATE_ADDRESS,
  CREATE_CONTACT,
  CREATE_OPPORTUNITY
} from './graphql/entityQueries.js';

class EntityService {
  constructor(graphqlClient) {
    this.graphqlClient = graphqlClient;
  }

  /**
   * Get all creatable parent entities
   * @returns {Promise<Array>} Creatable parent entities
   */
  async getCreatableParentEntities() {
    try {
      const response = await this.graphqlClient.query(GET_CREATABLE_PARENT_ENTITIES);
      return response.data.creatableParentEntities;
    } catch (error) {
      console.error('Failed to fetch creatable parent entities:', error);
      throw error;
    }
  }

  /**
   * Get entity types by parent
   * @param {string} parentId - Parent entity ID
   * @returns {Promise<Array>} Entity types
   */
  async getEntityTypesByParent(parentId) {
    try {
      const response = await this.graphqlClient.query(GET_ENTITY_TYPES_BY_PARENT, { parentId });
      return response.data.entityTypesByParent;
    } catch (error) {
      console.error('Failed to fetch entity types by parent:', error);
      throw error;
    }
  }

  /**
   * Get entity subtypes by type
   * @param {string} typeId - Entity type ID
   * @returns {Promise<Array>} Entity subtypes
   */
  async getEntitySubtypesByType(typeId) {
    try {
      const response = await this.graphqlClient.query(GET_ENTITY_SUBTYPES_BY_TYPE, { typeId });
      return response.data.entitySubtypesByType;
    } catch (error) {
      console.error('Failed to fetch entity subtypes:', error);
      throw error;
    }
  }

  /**
   * Get form by subtype
   * @param {string} subtypeId - Entity subtype ID
   * @returns {Promise<Object>} Form with fields
   */
  async getFormBySubtype(subtypeId) {
    try {
      const response = await this.graphqlClient.query(GET_FORM_BY_SUBTYPE, { subtypeId });
      return response.data.formBySubtype;
    } catch (error) {
      console.error('Failed to fetch form by subtype:', error);
      throw error;
    }
  }

  /**
   * Create address entity
   * @param {Object} input - Address input
   * @returns {Promise<Object>} Created address
   */
  async createAddress(input) {
    try {
      const response = await this.graphqlClient.mutate(CREATE_ADDRESS, { input });
      return response.data.createAddress;
    } catch (error) {
      console.error('Failed to create address:', error);
      throw error;
    }
  }

  /**
   * Create contact entity
   * @param {Object} input - Contact input
   * @returns {Promise<Object>} Created contact
   */
  async createContact(input) {
    try {
      const response = await this.graphqlClient.mutate(CREATE_CONTACT, { input });
      return response.data.createContact;
    } catch (error) {
      console.error('Failed to create contact:', error);
      throw error;
    }
  }

  /**
   * Create opportunity entity
   * @param {Object} input - Opportunity input
   * @returns {Promise<Object>} Created opportunity
   */
  async createOpportunity(input) {
    try {
      const response = await this.graphqlClient.mutate(CREATE_OPPORTUNITY, { input });
      return response.data.createOpportunity;
    } catch (error) {
      console.error('Failed to create opportunity:', error);
      throw error;
    }
  }

  /**
   * For testing/development - return mock data when no API is available
   */
  async getMockCreatableParentEntities() {
    // Only show Address and Contact options for now
    return [
      { id: '7215be3e-ba40-4b1d-89d7-0cae526cba05', displayName: 'Address', parentCategory: 'Location' },
      { id: '5234af67-44a9-4641-8dbb-96de2ad4a2c2', displayName: 'Contact', parentCategory: 'Person' }
      // Opportunity temporarily disabled
      // { id: '9872ec45-3f12-4a78-b56d-7e9a1c3b8d24', displayName: 'Opportunity', parentCategory: 'Business' }
    ];
  }

  async getMockEntityTypesByParent(parentId) {
    const types = {
      '7215be3e-ba40-4b1d-89d7-0cae526cba05': [ // Address types
        { id: 'a123b456-7c89-0d12-e34f-5678g9012h3', displayName: 'Residential Address' },
        { id: 'b234c567-8d90-1e23-f45g-6789h0123i4', displayName: 'Commercial Address' }
      ],
      '5234af67-44a9-4641-8dbb-96de2ad4a2c2': [ // Contact types
        { id: 'c345d678-9e01-2f34-g56h-7890i1234j5', displayName: 'Residential Contact' },
        { id: 'd456e789-0f12-3g45-h67i-8901j2345k6', displayName: 'Commercial Contact' }
      ],
      '9872ec45-3f12-4a78-b56d-7e9a1c3b8d24': [ // Opportunity types
        { id: 'e567f890-1g23-4h56-i78j-9012k3456l7', displayName: 'Roofing Project' },
        { id: 'f678g901-2h34-5i67-j89k-0123l4567m8', displayName: 'Siding Project' }
      ]
    };
    
    return types[parentId] || [];
  }

  async getMockEntitySubtypesByType(typeId) {
    // Just a simple example for demonstration
    return [
      { id: 'st-' + typeId.substring(0, 8), name: 'Primary', description: 'Primary subtype', isActive: true },
      { id: 'st-' + typeId.substring(8, 16), name: 'Secondary', description: 'Secondary subtype', isActive: true }
    ];
  }

  async getMockFormBySubtype(subtypeId) {
    return {
      id: 'form-' + subtypeId.substring(0, 8),
      title: 'Entity Form',
      description: 'Form for creating entity',
      entitySubtypeId: subtypeId,
      isActive: true,
      fields: [
        {
          id: 'field1',
          formId: 'form-' + subtypeId.substring(0, 8),
          fieldName: 'name',
          displayName: 'Name',
          fieldType: 'text',
          isRequired: true,
          displayOrder: 1
        },
        {
          id: 'field2',
          formId: 'form-' + subtypeId.substring(0, 8),
          fieldName: 'description',
          displayName: 'Description',
          fieldType: 'textarea',
          isRequired: false,
          displayOrder: 2
        },
        {
          id: 'field3',
          formId: 'form-' + subtypeId.substring(0, 8),
          fieldName: 'status',
          displayName: 'Status',
          fieldType: 'select',
          isRequired: true,
          options: { options: ['Active', 'Inactive', 'Pending'] },
          displayOrder: 3
        }
      ]
    };
  }
}

// Export singleton instance
export default EntityService;