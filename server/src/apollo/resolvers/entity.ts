import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { Context } from '../context';

export const entityResolvers = {
  Query: {
    entityTypes: async (_parent: any, _args: any, context: Context) => {
      try {
        // In a real implementation, fetch from database
        return await context.db.query(`
          SELECT * FROM entity_types WHERE is_active = true ORDER BY display_name
        `);
      } catch (error: any) {
        throw new Error(`Failed to fetch entity types: ${error.message}`);
      }
    },

    entityType: async (_parent: any, { id }: { id: string }, context: Context) => {
      try {
        const [entityType] = await context.db.query(`
          SELECT * FROM entity_types WHERE id = $1 AND is_active = true
        `, [id]);
        
        return entityType || null;
      } catch (error: any) {
        throw new Error(`Failed to fetch entity type: ${error.message}`);
      }
    },

    // New queries for entity creation flow
    creatableParentEntities: async (_parent: any, _args: any, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      try {
        // Call the database function
        return await context.db.query(`SELECT * FROM get_creatable_parent_entities()`);
      } catch (error: any) {
        throw new Error(`Failed to fetch creatable parent entities: ${error.message}`);
      }
    },

    entityTypesByParent: async (_parent: any, { parentId }: { parentId: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      try {
        // Call the database function
        return await context.db.query(`SELECT * FROM get_entity_types($1)`, [parentId]);
      } catch (error: any) {
        throw new Error(`Failed to fetch entity types for parent: ${error.message}`);
      }
    },

    entitySubtypesByType: async (_parent: any, { typeId }: { typeId: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      try {
        // Call the database function
        return await context.db.query(`SELECT * FROM get_entity_subtypes_by_type($1)`, [typeId]);
      } catch (error: any) {
        throw new Error(`Failed to fetch entity subtypes: ${error.message}`);
      }
    },

    formBySubtype: async (_parent: any, { subtypeId }: { subtypeId: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      try {
        // Call the database function to get the form
        const [form] = await context.db.query(`SELECT * FROM get_form_by_subtype($1)`, [subtypeId]);
        
        if (!form) {
          return null;
        }
        
        // Get the form fields
        const fields = await context.db.query(`
          SELECT * FROM entity_form_fields 
          WHERE form_id = $1 
          ORDER BY display_order
        `, [form.id]);
        
        // Combine form with its fields
        return {
          ...form,
          fields
        };
      } catch (error: any) {
        throw new Error(`Failed to fetch form by subtype: ${error.message}`);
      }
    },

    entities: async (_parent: any, args: any, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      // Implementation would go here - using filter, limit, offset

      return [];
    },

    entity: async (_parent: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      // Implementation would go here
      return null;
    },

    addresses: async (_parent: any, args: any, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      // Implementation would go here
      return [];
    },

    contacts: async (_parent: any, args: any, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      // Implementation would go here
      return [];
    },

    opportunities: async (_parent: any, args: any, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      // Implementation would go here
      return [];
    }
  },

  Mutation: {
    createEntity: async (_parent: any, { input }: any, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      // Implementation would go here
      return null;
    },

    updateEntity: async (_parent: any, { id, input }: any, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      // Implementation would go here
      return null;
    },

    createAddress: async (_parent: any, { input }: any, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      // Implementation would go here
      return null;
    },

    createContact: async (_parent: any, { input }: any, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      // Implementation would go here
      return null;
    },

    createOpportunity: async (_parent: any, { input }: any, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      // Implementation would go here
      return null;
    }
  },

  Entity: {
    type: async (parent: any, _args: any, context: Context) => {
      const { entityTypeId } = parent;
      
      try {
        const [entityType] = await context.db.query(`
          SELECT * FROM entity_types WHERE id = $1
        `, [entityTypeId]);
        
        return entityType || null;
      } catch (error) {
        console.error('Error fetching entity type:', error);
        return null;
      }
    },
    
    // Other entity field resolvers would go here
  },

  EntityType: {
    entities: async (parent: any, args: any, context: Context) => {
      const { id } = parent;
      const { filter = {}, limit = 50, offset = 0 } = args;
      
      // Implementation would go here
      return [];
    },
    
    settings: async (parent: any, _args: any, context: Context) => {
      const { id } = parent;
      
      try {
        return await context.db.query(`
          SELECT * FROM entity_type_settings WHERE entity_type_id = $1
        `, [id]);
      } catch (error) {
        console.error('Error fetching entity type settings:', error);
        return [];
      }
    }
  },

  EntityForm: {
    fields: async (parent: any, _args: any, context: Context) => {
      const { id } = parent;
      
      try {
        return await context.db.query(`
          SELECT * FROM entity_form_fields 
          WHERE form_id = $1
          ORDER BY display_order
        `, [id]);
      } catch (error) {
        console.error('Error fetching form fields:', error);
        return [];
      }
    }
  }
};