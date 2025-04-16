import { Context } from '../context';
import { Pool } from 'pg';
import { ApolloError, UserInputError } from 'apollo-server-express';

// Type definitions
interface SalesTrackFilter {
  ids?: string[];
  entityTypeIds?: string[];
  isActive?: boolean;
  departmentIds?: string[];
  search?: string;
}

interface SalesDriveFilter {
  trackIds?: string[];
  isActive?: boolean;
  search?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

interface SalesStopFilter {
  driveIds?: string[];
  stopTypeIds?: string[];
  isActive?: boolean;
  search?: string;
}

interface TouchpointFilter {
  entityId?: string;
  entityTypeId?: string;
  touchpointCodeIds?: string[];
  createdBy?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

export const salesTrackResolvers = {
  Query: {
    // Sales Track queries
    salesTracks: async (_: any, { filter, limit = 10, offset = 0 }: { filter?: SalesTrackFilter, limit?: number, offset?: number }, { db }: Context) => {
      try {
        let query = `
          SELECT * FROM sales_tracks
          WHERE 1=1
        `;
        const params: any[] = [];
        let paramIndex = 1;

        if (filter) {
          if (filter.ids && filter.ids.length > 0) {
            query += ` AND id = ANY($${paramIndex})`;
            params.push(filter.ids);
            paramIndex++;
          }

          if (filter.entityTypeIds && filter.entityTypeIds.length > 0) {
            query += ` AND entity_type_id = ANY($${paramIndex})`;
            params.push(filter.entityTypeIds);
            paramIndex++;
          }

          if (filter.isActive !== undefined) {
            query += ` AND is_active = $${paramIndex}`;
            params.push(filter.isActive);
            paramIndex++;
          }

          if (filter.search) {
            query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
            params.push(`%${filter.search}%`);
            paramIndex++;
          }
        }

        query += ` ORDER BY name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await db.query(query, params);
        return result.rows;
      } catch (error) {
        console.error('Error fetching sales tracks:', error);
        throw new ApolloError('Failed to fetch sales tracks');
      }
    },

    salesTrack: async (_: any, { id }: { id: string }, { db }: Context) => {
      try {
        const query = 'SELECT * FROM sales_tracks WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
      } catch (error) {
        console.error('Error fetching sales track:', error);
        throw new ApolloError('Failed to fetch sales track');
      }
    },

    // Sales Drive queries
    salesDrives: async (_: any, { filter, limit = 10, offset = 0 }: { filter?: SalesDriveFilter, limit?: number, offset?: number }, { db }: Context) => {
      try {
        let query = `
          SELECT * FROM sales_drives
          WHERE 1=1
        `;
        const params: any[] = [];
        let paramIndex = 1;

        if (filter) {
          if (filter.trackIds && filter.trackIds.length > 0) {
            query += ` AND sales_track_id = ANY($${paramIndex})`;
            params.push(filter.trackIds);
            paramIndex++;
          }

          if (filter.isActive !== undefined) {
            query += ` AND is_active = $${paramIndex}`;
            params.push(filter.isActive);
            paramIndex++;
          }

          if (filter.search) {
            query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
            params.push(`%${filter.search}%`);
            paramIndex++;
          }

          if (filter.dateRange) {
            query += ` AND (
              (start_date IS NULL OR start_date <= $${paramIndex + 1}) AND
              (end_date IS NULL OR end_date >= $${paramIndex})
            )`;
            params.push(filter.dateRange.startDate, filter.dateRange.endDate);
            paramIndex += 2;
          }
        }

        query += ` ORDER BY name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await db.query(query, params);
        return result.rows;
      } catch (error) {
        console.error('Error fetching sales drives:', error);
        throw new ApolloError('Failed to fetch sales drives');
      }
    },

    salesDrive: async (_: any, { id }: { id: string }, { db }: Context) => {
      try {
        const query = 'SELECT * FROM sales_drives WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
      } catch (error) {
        console.error('Error fetching sales drive:', error);
        throw new ApolloError('Failed to fetch sales drive');
      }
    },

    // Sales Stop queries
    salesStops: async (_: any, { filter, limit = 10, offset = 0 }: { filter?: SalesStopFilter, limit?: number, offset?: number }, { db }: Context) => {
      try {
        let query = `
          SELECT * FROM sales_stops
          WHERE 1=1
        `;
        const params: any[] = [];
        let paramIndex = 1;

        if (filter) {
          if (filter.driveIds && filter.driveIds.length > 0) {
            query += ` AND sales_drive_id = ANY($${paramIndex})`;
            params.push(filter.driveIds);
            paramIndex++;
          }

          if (filter.stopTypeIds && filter.stopTypeIds.length > 0) {
            query += ` AND stop_type_id = ANY($${paramIndex})`;
            params.push(filter.stopTypeIds);
            paramIndex++;
          }

          if (filter.isActive !== undefined) {
            query += ` AND is_active = $${paramIndex}`;
            params.push(filter.isActive);
            paramIndex++;
          }

          if (filter.search) {
            query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
            params.push(`%${filter.search}%`);
            paramIndex++;
          }
        }

        query += ` ORDER BY display_order ASC, name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await db.query(query, params);
        return result.rows;
      } catch (error) {
        console.error('Error fetching sales stops:', error);
        throw new ApolloError('Failed to fetch sales stops');
      }
    },

    salesStop: async (_: any, { id }: { id: string }, { db }: Context) => {
      try {
        const query = 'SELECT * FROM sales_stops WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
      } catch (error) {
        console.error('Error fetching sales stop:', error);
        throw new ApolloError('Failed to fetch sales stop');
      }
    },

    // Entities in a stop
    salesStopEntities: async (_: any, { stopId, filter, limit = 10, offset = 0 }: { stopId: string, filter?: any, limit?: number, offset?: number }, { db }: Context) => {
      try {
        // First, we need to get the stop to determine its type
        const stopQuery = 'SELECT * FROM sales_stops WHERE id = $1';
        const stopResult = await db.query(stopQuery, [stopId]);
        const stop = stopResult.rows[0];
        
        if (!stop) {
          throw new UserInputError('Sales stop not found');
        }
        
        // Get the entities in this stop
        // This is a simplified example - in reality, this would be a more complex query
        // that joins with entity_touchpoints and other tables
        const entitiesQuery = `
          SELECT e.* 
          FROM entities e
          JOIN entity_touchpoints et ON e.id = et.entity_id
          JOIN touchpoint_codes tc ON et.touchpoint_code_id = tc.id
          WHERE tc.stop_type_id = $1
          ORDER BY et.created_at DESC
          LIMIT $2 OFFSET $3
        `;
        
        const result = await db.query(entitiesQuery, [stop.stop_type_id, limit, offset]);
        return result.rows;
      } catch (error) {
        console.error('Error fetching sales stop entities:', error);
        throw new ApolloError('Failed to fetch sales stop entities');
      }
    },

    // Touchpoint queries
    touchpointTypes: async (_: any, {}: {}, { db }: Context) => {
      try {
        const query = 'SELECT * FROM touchpoint_types WHERE is_active = true ORDER BY name ASC';
        const result = await db.query(query);
        return result.rows;
      } catch (error) {
        console.error('Error fetching touchpoint types:', error);
        throw new ApolloError('Failed to fetch touchpoint types');
      }
    },

    touchpointCodes: async (_: any, { stopTypeId }: { stopTypeId?: string }, { db }: Context) => {
      try {
        let query = 'SELECT * FROM touchpoint_codes WHERE is_active = true';
        const params: any[] = [];
        
        if (stopTypeId) {
          query += ' AND stop_type_id = $1';
          params.push(stopTypeId);
        }
        
        query += ' ORDER BY code ASC';
        
        const result = await db.query(query, params);
        return result.rows;
      } catch (error) {
        console.error('Error fetching touchpoint codes:', error);
        throw new ApolloError('Failed to fetch touchpoint codes');
      }
    },

    entityTouchpoints: async (_: any, { filter, limit = 10, offset = 0 }: { filter?: TouchpointFilter, limit?: number, offset?: number }, { db }: Context) => {
      try {
        let query = `
          SELECT * FROM entity_touchpoints
          WHERE 1=1
        `;
        const params: any[] = [];
        let paramIndex = 1;

        if (filter) {
          if (filter.entityId) {
            query += ` AND entity_id = $${paramIndex}`;
            params.push(filter.entityId);
            paramIndex++;
          }

          if (filter.entityTypeId) {
            query += ` AND entity_type_id = $${paramIndex}`;
            params.push(filter.entityTypeId);
            paramIndex++;
          }

          if (filter.touchpointCodeIds && filter.touchpointCodeIds.length > 0) {
            query += ` AND touchpoint_code_id = ANY($${paramIndex})`;
            params.push(filter.touchpointCodeIds);
            paramIndex++;
          }

          if (filter.createdBy) {
            query += ` AND created_by = $${paramIndex}`;
            params.push(filter.createdBy);
            paramIndex++;
          }

          if (filter.dateRange) {
            query += ` AND created_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
            params.push(filter.dateRange.startDate, filter.dateRange.endDate);
            paramIndex += 2;
          }
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await db.query(query, params);
        return result.rows;
      } catch (error) {
        console.error('Error fetching entity touchpoints:', error);
        throw new ApolloError('Failed to fetch entity touchpoints');
      }
    },

    entityTouchpointHistory: async (_: any, { entityId, entityTypeId }: { entityId: string, entityTypeId: string }, { db }: Context) => {
      try {
        const query = `
          SELECT * FROM entity_touchpoints
          WHERE entity_id = $1 AND entity_type_id = $2
          ORDER BY created_at DESC
        `;
        
        const result = await db.query(query, [entityId, entityTypeId]);
        return result.rows;
      } catch (error) {
        console.error('Error fetching entity touchpoint history:', error);
        throw new ApolloError('Failed to fetch entity touchpoint history');
      }
    }
  },

  Mutation: {
    // Sales Track mutations
    createSalesTrack: async (_: any, { input }: { input: any }, { db, user }: Context) => {
      try {
        if (!user) {
          throw new ApolloError('You must be logged in to create a sales track', 'UNAUTHENTICATED');
        }
        
        const { name, description, icon, color, conditionsConfig, entityTypeId, settings } = input;
        
        const query = `
          INSERT INTO sales_tracks (
            name, description, icon, color, conditions_config, entity_type_id, settings, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
          RETURNING *
        `;
        
        const result = await db.query(query, [
          name, 
          description, 
          icon, 
          color, 
          conditionsConfig || null, 
          entityTypeId || null, 
          settings || null
        ]);
        
        return result.rows[0];
      } catch (error) {
        console.error('Error creating sales track:', error);
        throw new ApolloError('Failed to create sales track');
      }
    },

    updateSalesTrack: async (_: any, { id, input }: { id: string, input: any }, { db, user }: Context) => {
      try {
        if (!user) {
          throw new ApolloError('You must be logged in to update a sales track', 'UNAUTHENTICATED');
        }
        
        // First, check if the sales track exists
        const checkQuery = 'SELECT * FROM sales_tracks WHERE id = $1';
        const checkResult = await db.query(checkQuery, [id]);
        
        if (checkResult.rows.length === 0) {
          throw new UserInputError('Sales track not found');
        }
        
        // Build the update query dynamically based on provided fields
        let setClause = '';
        const queryParams: any[] = [id];
        let paramIndex = 2;
        
        if (input.name !== undefined) {
          setClause += `name = $${paramIndex}, `;
          queryParams.push(input.name);
          paramIndex++;
        }
        
        if (input.description !== undefined) {
          setClause += `description = $${paramIndex}, `;
          queryParams.push(input.description);
          paramIndex++;
        }
        
        if (input.icon !== undefined) {
          setClause += `icon = $${paramIndex}, `;
          queryParams.push(input.icon);
          paramIndex++;
        }
        
        if (input.color !== undefined) {
          setClause += `color = $${paramIndex}, `;
          queryParams.push(input.color);
          paramIndex++;
        }
        
        if (input.isActive !== undefined) {
          setClause += `is_active = $${paramIndex}, `;
          queryParams.push(input.isActive);
          paramIndex++;
        }
        
        if (input.conditionsConfig !== undefined) {
          setClause += `conditions_config = $${paramIndex}, `;
          queryParams.push(input.conditionsConfig);
          paramIndex++;
        }
        
        if (input.entityTypeId !== undefined) {
          setClause += `entity_type_id = $${paramIndex}, `;
          queryParams.push(input.entityTypeId);
          paramIndex++;
        }
        
        if (input.settings !== undefined) {
          setClause += `settings = $${paramIndex}, `;
          queryParams.push(input.settings);
          paramIndex++;
        }
        
        // Only update if there are fields to update
        if (setClause === '') {
          // No fields to update, just return the current record
          return checkResult.rows[0];
        }
        
        // Add the updated_at timestamp
        setClause += 'updated_at = NOW()';
        
        const updateQuery = `
          UPDATE sales_tracks
          SET ${setClause}
          WHERE id = $1
          RETURNING *
        `;
        
        const result = await db.query(updateQuery, queryParams);
        return result.rows[0];
      } catch (error) {
        console.error('Error updating sales track:', error);
        throw new ApolloError('Failed to update sales track');
      }
    },

    // Sales Drive mutations
    createSalesDrive: async (_: any, { input }: { input: any }, { db, user }: Context) => {
      try {
        if (!user) {
          throw new ApolloError('You must be logged in to create a sales drive', 'UNAUTHENTICATED');
        }
        
        const { salesTrackId, name, description, icon, color, startDate, endDate, settings } = input;
        
        // Verify the sales track exists
        const trackCheck = await db.query('SELECT * FROM sales_tracks WHERE id = $1', [salesTrackId]);
        if (trackCheck.rows.length === 0) {
          throw new UserInputError('Sales track not found');
        }
        
        const query = `
          INSERT INTO sales_drives (
            sales_track_id, name, description, icon, color, start_date, end_date, settings, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          RETURNING *
        `;
        
        const result = await db.query(query, [
          salesTrackId,
          name,
          description,
          icon,
          color,
          startDate || null,
          endDate || null,
          settings || null
        ]);
        
        return result.rows[0];
      } catch (error) {
        console.error('Error creating sales drive:', error);
        throw new ApolloError('Failed to create sales drive');
      }
    },

    updateSalesDrive: async (_: any, { id, input }: { id: string, input: any }, { db, user }: Context) => {
      try {
        if (!user) {
          throw new ApolloError('You must be logged in to update a sales drive', 'UNAUTHENTICATED');
        }
        
        // First, check if the sales drive exists
        const checkQuery = 'SELECT * FROM sales_drives WHERE id = $1';
        const checkResult = await db.query(checkQuery, [id]);
        
        if (checkResult.rows.length === 0) {
          throw new UserInputError('Sales drive not found');
        }
        
        // Build the update query dynamically based on provided fields
        let setClause = '';
        const queryParams: any[] = [id];
        let paramIndex = 2;
        
        if (input.name !== undefined) {
          setClause += `name = $${paramIndex}, `;
          queryParams.push(input.name);
          paramIndex++;
        }
        
        if (input.description !== undefined) {
          setClause += `description = $${paramIndex}, `;
          queryParams.push(input.description);
          paramIndex++;
        }
        
        if (input.icon !== undefined) {
          setClause += `icon = $${paramIndex}, `;
          queryParams.push(input.icon);
          paramIndex++;
        }
        
        if (input.color !== undefined) {
          setClause += `color = $${paramIndex}, `;
          queryParams.push(input.color);
          paramIndex++;
        }
        
        if (input.isActive !== undefined) {
          setClause += `is_active = $${paramIndex}, `;
          queryParams.push(input.isActive);
          paramIndex++;
        }
        
        if (input.startDate !== undefined) {
          setClause += `start_date = $${paramIndex}, `;
          queryParams.push(input.startDate);
          paramIndex++;
        }
        
        if (input.endDate !== undefined) {
          setClause += `end_date = $${paramIndex}, `;
          queryParams.push(input.endDate);
          paramIndex++;
        }
        
        if (input.settings !== undefined) {
          setClause += `settings = $${paramIndex}, `;
          queryParams.push(input.settings);
          paramIndex++;
        }
        
        // Only update if there are fields to update
        if (setClause === '') {
          // No fields to update, just return the current record
          return checkResult.rows[0];
        }
        
        // Add the updated_at timestamp
        setClause += 'updated_at = NOW()';
        
        const updateQuery = `
          UPDATE sales_drives
          SET ${setClause}
          WHERE id = $1
          RETURNING *
        `;
        
        const result = await db.query(updateQuery, queryParams);
        return result.rows[0];
      } catch (error) {
        console.error('Error updating sales drive:', error);
        throw new ApolloError('Failed to update sales drive');
      }
    },

    // Sales Stop mutations
    createSalesStop: async (_: any, { input }: { input: any }, { db, user }: Context) => {
      try {
        if (!user) {
          throw new ApolloError('You must be logged in to create a sales stop', 'UNAUTHENTICATED');
        }
        
        const { salesDriveId, stopTypeId, name, description, displayOrder, color, icon, metadata } = input;
        
        // Verify the sales drive exists
        const driveCheck = await db.query('SELECT * FROM sales_drives WHERE id = $1', [salesDriveId]);
        if (driveCheck.rows.length === 0) {
          throw new UserInputError('Sales drive not found');
        }
        
        // Verify the stop type exists if provided
        if (stopTypeId) {
          const typeCheck = await db.query('SELECT * FROM sales_stop_types WHERE id = $1', [stopTypeId]);
          if (typeCheck.rows.length === 0) {
            throw new UserInputError('Sales stop type not found');
          }
        }
        
        const query = `
          INSERT INTO sales_stops (
            sales_drive_id, stop_type_id, name, description, display_order, color, icon, metadata, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          RETURNING *
        `;
        
        const result = await db.query(query, [
          salesDriveId,
          stopTypeId || null,
          name,
          description || null,
          displayOrder || null,
          color || null,
          icon || null,
          metadata || null
        ]);
        
        return result.rows[0];
      } catch (error) {
        console.error('Error creating sales stop:', error);
        throw new ApolloError('Failed to create sales stop');
      }
    },

    updateSalesStop: async (_: any, { id, input }: { id: string, input: any }, { db, user }: Context) => {
      try {
        if (!user) {
          throw new ApolloError('You must be logged in to update a sales stop', 'UNAUTHENTICATED');
        }
        
        // First, check if the sales stop exists
        const checkQuery = 'SELECT * FROM sales_stops WHERE id = $1';
        const checkResult = await db.query(checkQuery, [id]);
        
        if (checkResult.rows.length === 0) {
          throw new UserInputError('Sales stop not found');
        }
        
        // Build the update query dynamically based on provided fields
        let setClause = '';
        const queryParams: any[] = [id];
        let paramIndex = 2;
        
        if (input.name !== undefined) {
          setClause += `name = $${paramIndex}, `;
          queryParams.push(input.name);
          paramIndex++;
        }
        
        if (input.description !== undefined) {
          setClause += `description = $${paramIndex}, `;
          queryParams.push(input.description);
          paramIndex++;
        }
        
        if (input.isActive !== undefined) {
          setClause += `is_active = $${paramIndex}, `;
          queryParams.push(input.isActive);
          paramIndex++;
        }
        
        if (input.displayOrder !== undefined) {
          setClause += `display_order = $${paramIndex}, `;
          queryParams.push(input.displayOrder);
          paramIndex++;
        }
        
        if (input.color !== undefined) {
          setClause += `color = $${paramIndex}, `;
          queryParams.push(input.color);
          paramIndex++;
        }
        
        if (input.icon !== undefined) {
          setClause += `icon = $${paramIndex}, `;
          queryParams.push(input.icon);
          paramIndex++;
        }
        
        if (input.isArchived !== undefined) {
          setClause += `is_archived = $${paramIndex}, `;
          queryParams.push(input.isArchived);
          paramIndex++;
        }
        
        if (input.metadata !== undefined) {
          setClause += `metadata = $${paramIndex}, `;
          queryParams.push(input.metadata);
          paramIndex++;
        }
        
        // Only update if there are fields to update
        if (setClause === '') {
          // No fields to update, just return the current record
          return checkResult.rows[0];
        }
        
        // Add the updated_at timestamp
        setClause += 'updated_at = NOW()';
        
        const updateQuery = `
          UPDATE sales_stops
          SET ${setClause}
          WHERE id = $1
          RETURNING *
        `;
        
        const result = await db.query(updateQuery, queryParams);
        return result.rows[0];
      } catch (error) {
        console.error('Error updating sales stop:', error);
        throw new ApolloError('Failed to update sales stop');
      }
    },

    // Entity Movement
    moveEntity: async (_: any, { input }: { input: any }, { db, user }: Context) => {
      try {
        if (!user) {
          throw new ApolloError('You must be logged in to move an entity', 'UNAUTHENTICATED');
        }
        
        const { entityId, entityTypeId, fromStopId, toStopId, touchpointCodeId, notes } = input;
        
        // Validate the entity exists
        const entityCheck = await db.query('SELECT * FROM entities WHERE id = $1', [entityId]);
        if (entityCheck.rows.length === 0) {
          throw new UserInputError('Entity not found');
        }
        
        // Validate the stops exist
        const fromStopCheck = await db.query('SELECT * FROM sales_stops WHERE id = $1', [fromStopId]);
        if (fromStopCheck.rows.length === 0) {
          throw new UserInputError('From stop not found');
        }
        
        const toStopCheck = await db.query('SELECT * FROM sales_stops WHERE id = $1', [toStopId]);
        if (toStopCheck.rows.length === 0) {
          throw new UserInputError('To stop not found');
        }
        
        // If touchpoint code is provided, validate it
        if (touchpointCodeId) {
          const codeCheck = await db.query('SELECT * FROM touchpoint_codes WHERE id = $1', [touchpointCodeId]);
          if (codeCheck.rows.length === 0) {
            throw new UserInputError('Touchpoint code not found');
          }
        }
        
        // Create a new touchpoint record for the movement
        const touchpointQuery = `
          INSERT INTO entity_touchpoints (
            entity_id, entity_type_id, touchpoint_code_id, notes, created_by, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          RETURNING *
        `;
        
        const touchpointResult = await db.query(touchpointQuery, [
          entityId,
          entityTypeId,
          touchpointCodeId || null,
          notes || null,
          user.id
        ]);
        
        return touchpointResult.rows[0];
      } catch (error) {
        console.error('Error moving entity:', error);
        throw new ApolloError('Failed to move entity');
      }
    },

    // Touchpoint creation
    createTouchpoint: async (_: any, { input }: { input: any }, { db, user }: Context) => {
      try {
        if (!user) {
          throw new ApolloError('You must be logged in to create a touchpoint', 'UNAUTHENTICATED');
        }
        
        const { entityId, entityTypeId, touchpointCodeId, notes, status } = input;
        
        // Validate the entity exists
        const entityCheck = await db.query('SELECT * FROM entities WHERE id = $1', [entityId]);
        if (entityCheck.rows.length === 0) {
          throw new UserInputError('Entity not found');
        }
        
        // Validate the touchpoint code exists
        const codeCheck = await db.query('SELECT * FROM touchpoint_codes WHERE id = $1', [touchpointCodeId]);
        if (codeCheck.rows.length === 0) {
          throw new UserInputError('Touchpoint code not found');
        }
        
        const query = `
          INSERT INTO entity_touchpoints (
            entity_id, entity_type_id, touchpoint_code_id, notes, status, created_by, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          RETURNING *
        `;
        
        const result = await db.query(query, [
          entityId,
          entityTypeId,
          touchpointCodeId,
          notes || null,
          status || null,
          user.id
        ]);
        
        return result.rows[0];
      } catch (error) {
        console.error('Error creating touchpoint:', error);
        throw new ApolloError('Failed to create touchpoint');
      }
    }
  },

  // Type resolvers
  SalesTrack: {
    drives: async (parent: any, _: any, { db }: Context) => {
      try {
        const query = 'SELECT * FROM sales_drives WHERE sales_track_id = $1 ORDER BY name ASC';
        const result = await db.query(query, [parent.id]);
        return result.rows;
      } catch (error) {
        console.error('Error fetching sales drives for track:', error);
        throw new ApolloError('Failed to fetch sales drives');
      }
    },
    
    departments: async (parent: any, _: any, { db }: Context) => {
      try {
        const query = 'SELECT * FROM sales_track_departments WHERE sales_track_id = $1';
        const result = await db.query(query, [parent.id]);
        return result.rows;
      } catch (error) {
        console.error('Error fetching departments for track:', error);
        throw new ApolloError('Failed to fetch departments');
      }
    },
    
    entityType: async (parent: any, _: any, { db }: Context) => {
      if (!parent.entity_type_id) return null;
      
      try {
        const query = 'SELECT * FROM entity_types WHERE id = $1';
        const result = await db.query(query, [parent.entity_type_id]);
        return result.rows[0] || null;
      } catch (error) {
        console.error('Error fetching entity type for track:', error);
        throw new ApolloError('Failed to fetch entity type');
      }
    }
  },
  
  SalesDrive: {
    track: async (parent: any, _: any, { db }: Context) => {
      try {
        const query = 'SELECT * FROM sales_tracks WHERE id = $1';
        const result = await db.query(query, [parent.sales_track_id]);
        return result.rows[0] || null;
      } catch (error) {
        console.error('Error fetching sales track for drive:', error);
        throw new ApolloError('Failed to fetch sales track');
      }
    },
    
    stops: async (parent: any, _: any, { db }: Context) => {
      try {
        const query = 'SELECT * FROM sales_stops WHERE sales_drive_id = $1 ORDER BY display_order ASC, name ASC';
        const result = await db.query(query, [parent.id]);
        return result.rows;
      } catch (error) {
        console.error('Error fetching sales stops for drive:', error);
        throw new ApolloError('Failed to fetch sales stops');
      }
    }
  },
  
  SalesStop: {
    drive: async (parent: any, _: any, { db }: Context) => {
      try {
        const query = 'SELECT * FROM sales_drives WHERE id = $1';
        const result = await db.query(query, [parent.sales_drive_id]);
        return result.rows[0] || null;
      } catch (error) {
        console.error('Error fetching sales drive for stop:', error);
        throw new ApolloError('Failed to fetch sales drive');
      }
    },
    
    type: async (parent: any, _: any, { db }: Context) => {
      if (!parent.stop_type_id) return null;
      
      try {
        const query = 'SELECT * FROM sales_stop_types WHERE id = $1';
        const result = await db.query(query, [parent.stop_type_id]);
        return result.rows[0] || null;
      } catch (error) {
        console.error('Error fetching stop type:', error);
        throw new ApolloError('Failed to fetch stop type');
      }
    },
    
    entities: async (parent: any, { filter, limit = 10, offset = 0 }: { filter?: any, limit?: number, offset?: number }, { db }: Context) => {
      try {
        // This is a simplified example - in reality, this would be a more complex query
        // that joins with entity_touchpoints and other tables
        const entitiesQuery = `
          SELECT e.* 
          FROM entities e
          JOIN entity_touchpoints et ON e.id = et.entity_id
          JOIN touchpoint_codes tc ON et.touchpoint_code_id = tc.id
          WHERE tc.stop_type_id = $1
          ORDER BY et.created_at DESC
          LIMIT $2 OFFSET $3
        `;
        
        const result = await db.query(entitiesQuery, [parent.stop_type_id, limit, offset]);
        return result.rows;
      } catch (error) {
        console.error('Error fetching entities for stop:', error);
        throw new ApolloError('Failed to fetch entities');
      }
    },
    
    entityCount: async (parent: any, _: any, { db }: Context) => {
      try {
        // Count entities in this stop
        const countQuery = `
          SELECT COUNT(*) 
          FROM entity_touchpoints et
          JOIN touchpoint_codes tc ON et.touchpoint_code_id = tc.id
          WHERE tc.stop_type_id = $1
        `;
        
        const result = await db.query(countQuery, [parent.stop_type_id]);
        return parseInt(result.rows[0].count, 10);
      } catch (error) {
        console.error('Error counting entities for stop:', error);
        throw new ApolloError('Failed to count entities');
      }
    }
  },
  
  EntityTouchpoint: {
    entity: async (parent: any, _: any, { db }: Context) => {
      try {
        const query = 'SELECT * FROM entities WHERE id = $1';
        const result = await db.query(query, [parent.entity_id]);
        return result.rows[0] || null;
      } catch (error) {
        console.error('Error fetching entity for touchpoint:', error);
        throw new ApolloError('Failed to fetch entity');
      }
    },
    
    touchpointCode: async (parent: any, _: any, { db }: Context) => {
      try {
        const query = 'SELECT * FROM touchpoint_codes WHERE id = $1';
        const result = await db.query(query, [parent.touchpoint_code_id]);
        return result.rows[0] || null;
      } catch (error) {
        console.error('Error fetching touchpoint code:', error);
        throw new ApolloError('Failed to fetch touchpoint code');
      }
    },
    
    createdByUser: async (parent: any, _: any, { db }: Context) => {
      if (!parent.created_by) return null;
      
      try {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await db.query(query, [parent.created_by]);
        return result.rows[0] || null;
      } catch (error) {
        console.error('Error fetching user for touchpoint:', error);
        throw new ApolloError('Failed to fetch user');
      }
    }
  }
};