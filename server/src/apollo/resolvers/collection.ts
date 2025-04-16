import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { Context } from '../context';

// Simple type definitions
interface CollectionFilter {
  status?: string[];
  search?: string;
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  createdBy?: string;
}

interface QueryArgs {
  filter?: CollectionFilter;
  limit?: number;
  offset?: number;
}

// Collection resolver implementation
export const collectionResolvers = {
  Query: {
    collections: async (_parent: any, args: QueryArgs, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      const { filter = {}, limit = 50, offset = 0 } = args;
      
      try {
        let query = `SELECT * FROM collections WHERE 1=1`;
        const params: any[] = [];
        let paramIndex = 1;
        
        if (filter.status && filter.status.length > 0) {
          query += ` AND status = ANY($${paramIndex})`;
          params.push(filter.status);
          paramIndex++;
        }
        
        if (filter.createdBy) {
          query += ` AND created_by = $${paramIndex}`;
          params.push(filter.createdBy);
          paramIndex++;
        }
        
        if (filter.search) {
          query += ` AND name ILIKE $${paramIndex}`;
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
        throw new Error(`Failed to fetch collections: ${error.message}`);
      }
    },
    
    collection: async (_parent: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      try {
        const result = await context.db.query(`
          SELECT * FROM collections WHERE id = $1
        `, [id]);
        
        return result.rows[0] || null;
      } catch (error: any) {
        throw new Error(`Failed to fetch collection: ${error.message}`);
      }
    }
  },
  
  Mutation: {
    createCollection: async (_parent: any, { input }: any, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      try {
        // Start a transaction
        await context.db.query('BEGIN');
        
        // Create the collection
        const collectionResult = await context.db.query(`
          INSERT INTO collections (
            name,
            status,
            filter_criteria,
            metadata,
            created_by
          ) VALUES (
            $1, $2, $3, $4, $5
          ) RETURNING *
        `, [
          input.name,
          input.status || 'ACTIVE',
          input.filterCriteria || null,
          input.metadata || {},
          context.user?.id
        ]);
        
        const collection = collectionResult.rows[0];
        
        // Initialize pulse items for the collection
        await initializeCollectionPulse(context, collection.id);
        
        // Commit the transaction
        await context.db.query('COMMIT');
        
        return collection;
      } catch (error: any) {
        // Rollback the transaction on error
        await context.db.query('ROLLBACK');
        
        throw new Error(`Failed to create collection: ${error.message}`);
      }
    }
  },
  
  Collection: {
    addresses: async (parent: any, _args: any, context: Context) => {
      try {
        const result = await context.db.query(`
          SELECT * FROM addresses 
          WHERE collection_id = $1
          ORDER BY created_at DESC
        `, [parent.id]);
        
        return result.rows;
      } catch (error) {
        console.error('Error fetching addresses for collection:', error);
        return [];
      }
    },
    
    contacts: async (parent: any, _args: any, context: Context) => {
      try {
        const result = await context.db.query(`
          SELECT * FROM contacts 
          WHERE collection_id = $1
          ORDER BY created_at DESC
        `, [parent.id]);
        
        return result.rows;
      } catch (error) {
        console.error('Error fetching contacts for collection:', error);
        return [];
      }
    },
    
    opportunities: async (parent: any, _args: any, context: Context) => {
      try {
        const result = await context.db.query(`
          SELECT * FROM opportunities 
          WHERE collection_id = $1
          ORDER BY created_at DESC
        `, [parent.id]);
        
        return result.rows;
      } catch (error) {
        console.error('Error fetching opportunities for collection:', error);
        return [];
      }
    }
  }
};

// Helper function to initialize collection pulse
async function initializeCollectionPulse(context: Context, collectionId: string): Promise<void> {
  // Create pulse items for different pulse types
  const pulseTypes = ['PHOTO', 'DOCUMENT', 'EMAIL', 'TASK', 'CALENDAR'];
  
  for (const pulseType of pulseTypes) {
    await context.db.query(`
      INSERT INTO collection_pulse (
        collection_id,
        pulse_type,
        content,
        status,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, '{}', 'ACTIVE', NOW(), NOW()
      )
    `, [collectionId, pulseType]);
  }
}