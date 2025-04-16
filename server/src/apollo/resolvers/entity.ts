import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { Context } from '../context';

// Define interfaces for entity types
interface EntityFilter {
  entityTypeIds?: string[];
  status?: string[];
  search?: string;
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  addressTypeIds?: string[];
  contactTypeIds?: string[];
  opportunityTypeIds?: string[];
  collectionIds?: string[];
}

interface QueryArgs {
  filter?: EntityFilter;
  limit?: number;
  offset?: number;
}

export const entityResolvers = {
  Query: {
    entityTypes: async (_parent: any, { isActive }: { isActive?: boolean }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      try {
        let query = `SELECT * FROM entity_types`;
        const params = [];
        
        if (isActive !== undefined) {
          query += ` WHERE is_active = $1`;
          params.push(isActive);
        }
        
        query += ` ORDER BY display_name`;
        
        const result = await context.db.query(query, params);
        return result.rows;
      } catch (error: any) {
        throw new Error(`Failed to fetch entity types: ${error.message}`);
      }
    },
    
    entityType: async (_parent: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      try {
        const result = await context.db.query(`
          SELECT * FROM entity_types WHERE id = $1
        `, [id]);
        
        return result.rows[0] || null;
      } catch (error: any) {
        throw new Error(`Failed to fetch entity type: ${error.message}`);
      }
    },
    
    addressTypes: async (_parent: any, { isActive }: { isActive?: boolean }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      try {
        let query = `SELECT * FROM address_types`;
        const params = [];
        
        if (isActive !== undefined) {
          query += ` WHERE is_active = $1`;
          params.push(isActive);
        }
        
        query += ` ORDER BY display_name`;
        
        const result = await context.db.query(query, params);
        return result.rows;
      } catch (error: any) {
        throw new Error(`Failed to fetch address types: ${error.message}`);
      }
    },
    
    contactTypes: async (_parent: any, { isActive }: { isActive?: boolean }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      try {
        let query = `SELECT * FROM contact_types`;
        const params = [];
        
        if (isActive !== undefined) {
          query += ` WHERE active = $1`;
          params.push(isActive);
        }
        
        query += ` ORDER BY display_name`;
        
        const result = await context.db.query(query, params);
        return result.rows;
      } catch (error: any) {
        throw new Error(`Failed to fetch contact types: ${error.message}`);
      }
    },
    
    addresses: async (_parent: any, args: QueryArgs, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      try {
        const { filter = {}, limit = 50, offset = 0 } = args;
        
        let query = `SELECT * FROM addresses WHERE 1=1`;
        const params: any[] = [];
        let paramIndex = 1;
        
        if (filter.status && filter.status.length > 0) {
          query += ` AND status = ANY($${paramIndex})`;
          params.push(filter.status);
          paramIndex++;
        }
        
        if (filter.addressTypeIds && filter.addressTypeIds.length > 0) {
          query += ` AND address_type_id = ANY($${paramIndex})`;
          params.push(filter.addressTypeIds);
          paramIndex++;
        }
        
        if (filter.collectionIds && filter.collectionIds.length > 0) {
          query += ` AND collection_id = ANY($${paramIndex})`;
          params.push(filter.collectionIds);
          paramIndex++;
        }
        
        if (filter.search) {
          query += ` AND (street ILIKE $${paramIndex} OR city ILIKE $${paramIndex} OR state ILIKE $${paramIndex} OR postal_code ILIKE $${paramIndex})`;
          params.push(`%${filter.search}%`);
          paramIndex++;
        }
        
        if (filter.dateRange) {
          if (filter.dateRange.startDate) {
            query += ` AND created_at >= $${paramIndex}`;
            params.push(filter.dateRange.startDate);
            paramIndex++;
          }
          
          if (filter.dateRange.endDate) {
            query += ` AND created_at <= $${paramIndex}`;
            params.push(filter.dateRange.endDate);
            paramIndex++;
          }
        }
        
        query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);
        
        const result = await context.db.query(query, params);
        return result.rows;
      } catch (error: any) {
        throw new Error(`Failed to fetch addresses: ${error.message}`);
      }
    },
    
    address: async (_parent: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      try {
        const result = await context.db.query(`
          SELECT * FROM addresses WHERE id = $1
        `, [id]);
        
        return result.rows[0] || null;
      } catch (error: any) {
        throw new Error(`Failed to fetch address: ${error.message}`);
      }
    },
    
    searchAddresses: async (_parent: any, { term, limit = 10 }: { term: string, limit?: number }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      try {
        // Search by street, city, state, zip
        const result = await context.db.query(`
          SELECT * FROM addresses 
          WHERE 
            street ILIKE $1 OR 
            city ILIKE $1 OR 
            state ILIKE $1 OR 
            postal_code ILIKE $1
          ORDER BY street
          LIMIT $2
        `, [`%${term}%`, limit]);
        
        return result.rows;
      } catch (error: any) {
        throw new Error(`Failed to search addresses: ${error.message}`);
      }
    }
  },
  
  Mutation: {
    createAddress: async (_parent: any, { input }: any, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      try {
        // Start a transaction
        await context.db.query('BEGIN');
        
        // Create the address
        const addressResult = await context.db.query(`
          INSERT INTO addresses (
            display_name,
            street,
            address_line_2,
            city,
            state,
            postal_code,
            notes,
            property_condition,
            next_knock_date,
            address_type_id,
            collection_id,
            status,
            metadata,
            created_by
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
          ) RETURNING *
        `, [
          input.displayName || null,
          input.street,
          input.addressLine2 || null,
          input.city || null,
          input.state || null,
          input.postalCode || null,
          input.notes || null,
          input.propertyCondition || {},
          input.nextKnockDate || null,
          input.addressTypeId,
          input.collectionId || null,
          'ACTIVE',
          input.metadata || {},
          context.user?.id
        ]);
        
        const address = addressResult.rows[0];
        
        // Commit the transaction
        await context.db.query('COMMIT');
        
        return address;
      } catch (error: any) {
        // Rollback the transaction on error
        await context.db.query('ROLLBACK');
        
        throw new Error(`Failed to create address: ${error.message}`);
      }
    }
  },
  
  // Field resolvers
  Address: {
    type: () => 'Address',
    
    addressType: async (parent: any, _args: any, context: Context) => {
      try {
        if (!parent.address_type_id) return null;
        
        const result = await context.db.query(`
          SELECT * FROM address_types WHERE id = $1
        `, [parent.address_type_id]);
        
        return result.rows[0] || null;
      } catch (error) {
        console.error('Error fetching address type:', error);
        return null;
      }
    },
    
    collection: async (parent: any, _args: any, context: Context) => {
      try {
        if (!parent.collection_id) return null;
        
        const result = await context.db.query(`
          SELECT * FROM collections WHERE id = $1
        `, [parent.collection_id]);
        
        return result.rows[0] || null;
      } catch (error) {
        console.error('Error fetching collection for address:', error);
        return null;
      }
    }
  }
};