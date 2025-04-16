/**
 * GraphQLService.js
 * 
 * Service for handling GraphQL queries and mutations
 */

class GraphQLService {
  static instance = null;

  constructor() {
    if (GraphQLService.instance) {
      return GraphQLService.instance;
    }
    
    GraphQLService.instance = this;
    
    // Use the server URL from window.location if available
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = window.location.port;
    
    // Default to localhost:4000 if window.location is not available
    this.apiUrl = `${protocol}//${host}${port ? `:${port}` : ''}/graphql`;
    
    // For development, you might want to override this
    // this.apiUrl = 'http://localhost:4000/graphql';
  }

  /**
   * Execute a GraphQL query
   * @param {string} query - GraphQL query string
   * @param {Object} variables - Query variables
   * @returns {Promise<Object>} Query result
   */
  async query(query, variables = {}) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Add authorization header if user is logged in
          ...(localStorage.getItem('token') && { 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          })
        },
        body: JSON.stringify({
          query,
          variables
        }),
        credentials: 'include' // Include cookies if needed
      });
      
      const result = await response.json();
      
      if (result.errors) {
        console.error('GraphQL Error:', result.errors);
        throw new Error(result.errors[0].message);
      }
      
      return result.data;
    } catch (error) {
      console.error('Error executing GraphQL query:', error);
      throw error;
    }
  }

  /**
   * Execute a GraphQL mutation
   * @param {string} mutation - GraphQL mutation string
   * @param {Object} variables - Mutation variables
   * @returns {Promise<Object>} Mutation result
   */
  async mutate(mutation, variables = {}) {
    // Mutations use the same mechanism as queries
    return this.query(mutation, variables);
  }

  /**
   * Fetch all sales tracks
   * @param {Object} filter - Filter criteria
   * @param {number} limit - Limit results
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} Sales tracks
   */
  async getSalesTracks(filter = {}, limit = 10, offset = 0) {
    try {
      // Import the query
      const { GET_SALES_TRACKS } = await import('./graphql/salesTrackQueries.js');
      
      // Execute the query
      const result = await this.query(GET_SALES_TRACKS, { filter, limit, offset });
      return result.salesTracks;
    } catch (error) {
      console.error('Error fetching sales tracks:', error);
      throw error;
    }
  }

  /**
   * Fetch a sales track by ID
   * @param {string} id - Sales track ID
   * @returns {Promise<Object>} Sales track
   */
  async getSalesTrack(id) {
    try {
      // Import the query
      const { GET_SALES_TRACK_DETAILS } = await import('./graphql/salesTrackQueries.js');
      
      // Execute the query
      const result = await this.query(GET_SALES_TRACK_DETAILS, { id });
      return result.salesTrack;
    } catch (error) {
      console.error('Error fetching sales track:', error);
      throw error;
    }
  }

  /**
   * Fetch sales drives
   * @param {Object} filter - Filter criteria
   * @param {number} limit - Limit results
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} Sales drives
   */
  async getSalesDrives(filter = {}, limit = 10, offset = 0) {
    try {
      // Import the query
      const { GET_SALES_DRIVES } = await import('./graphql/salesTrackQueries.js');
      
      // Execute the query
      const result = await this.query(GET_SALES_DRIVES, { filter, limit, offset });
      return result.salesDrives;
    } catch (error) {
      console.error('Error fetching sales drives:', error);
      throw error;
    }
  }

  /**
   * Fetch a sales drive by ID
   * @param {string} id - Sales drive ID
   * @returns {Promise<Object>} Sales drive
   */
  async getSalesDrive(id) {
    try {
      // Import the query
      const { GET_SALES_DRIVE_DETAILS } = await import('./graphql/salesTrackQueries.js');
      
      // Execute the query
      const result = await this.query(GET_SALES_DRIVE_DETAILS, { id });
      return result.salesDrive;
    } catch (error) {
      console.error('Error fetching sales drive:', error);
      throw error;
    }
  }

  /**
   * Fetch sales stops
   * @param {Object} filter - Filter criteria
   * @param {number} limit - Limit results
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} Sales stops
   */
  async getSalesStops(filter = {}, limit = 10, offset = 0) {
    try {
      // Import the query
      const { GET_SALES_STOPS } = await import('./graphql/salesTrackQueries.js');
      
      // Execute the query
      const result = await this.query(GET_SALES_STOPS, { filter, limit, offset });
      return result.salesStops;
    } catch (error) {
      console.error('Error fetching sales stops:', error);
      throw error;
    }
  }

  /**
   * Fetch a sales stop by ID
   * @param {string} id - Sales stop ID
   * @returns {Promise<Object>} Sales stop
   */
  async getSalesStop(id) {
    try {
      // Import the query
      const { GET_SALES_STOP_DETAILS } = await import('./graphql/salesTrackQueries.js');
      
      // Execute the query
      const result = await this.query(GET_SALES_STOP_DETAILS, { id });
      return result.salesStop;
    } catch (error) {
      console.error('Error fetching sales stop:', error);
      throw error;
    }
  }

  /**
   * Fetch entities in a sales stop
   * @param {string} stopId - Sales stop ID
   * @param {Object} filter - Filter criteria
   * @param {number} limit - Limit results
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} Entities
   */
  async getSalesStopEntities(stopId, filter = {}, limit = 10, offset = 0) {
    try {
      // Import the query
      const { GET_SALES_STOP_ENTITIES } = await import('./graphql/salesTrackQueries.js');
      
      // Execute the query
      const result = await this.query(GET_SALES_STOP_ENTITIES, { stopId, filter, limit, offset });
      return result.salesStopEntities;
    } catch (error) {
      console.error('Error fetching sales stop entities:', error);
      throw error;
    }
  }

  /**
   * Fetch touchpoint types
   * @returns {Promise<Array>} Touchpoint types
   */
  async getTouchpointTypes() {
    try {
      // Import the query
      const { GET_TOUCHPOINT_TYPES } = await import('./graphql/salesTrackQueries.js');
      
      // Execute the query
      const result = await this.query(GET_TOUCHPOINT_TYPES);
      return result.touchpointTypes;
    } catch (error) {
      console.error('Error fetching touchpoint types:', error);
      throw error;
    }
  }

  /**
   * Fetch touchpoint codes
   * @param {string} stopTypeId - Sales stop type ID
   * @returns {Promise<Array>} Touchpoint codes
   */
  async getTouchpointCodes(stopTypeId) {
    try {
      // Import the query
      const { GET_TOUCHPOINT_CODES } = await import('./graphql/salesTrackQueries.js');
      
      // Execute the query
      const result = await this.query(GET_TOUCHPOINT_CODES, { stopTypeId });
      return result.touchpointCodes;
    } catch (error) {
      console.error('Error fetching touchpoint codes:', error);
      throw error;
    }
  }

  /**
   * Fetch touchpoint history for an entity
   * @param {string} entityId - Entity ID
   * @param {string} entityTypeId - Entity type ID
   * @returns {Promise<Array>} Touchpoint history
   */
  async getEntityTouchpointHistory(entityId, entityTypeId) {
    try {
      // Import the query
      const { GET_ENTITY_TOUCHPOINT_HISTORY } = await import('./graphql/salesTrackQueries.js');
      
      // Execute the query
      const result = await this.query(GET_ENTITY_TOUCHPOINT_HISTORY, { entityId, entityTypeId });
      return result.entityTouchpointHistory;
    } catch (error) {
      console.error('Error fetching touchpoint history:', error);
      throw error;
    }
  }

  /**
   * Create a sales track
   * @param {Object} input - Sales track data
   * @returns {Promise<Object>} Created sales track
   */
  async createSalesTrack(input) {
    try {
      // Import the mutation
      const { CREATE_SALES_TRACK } = await import('./graphql/salesTrackQueries.js');
      
      // Execute the mutation
      const result = await this.mutate(CREATE_SALES_TRACK, { input });
      return result.createSalesTrack;
    } catch (error) {
      console.error('Error creating sales track:', error);
      throw error;
    }
  }

  /**
   * Update a sales track
   * @param {string} id - Sales track ID
   * @param {Object} input - Updated sales track data
   * @returns {Promise<Object>} Updated sales track
   */
  async updateSalesTrack(id, input) {
    try {
      // Import the mutation
      const { UPDATE_SALES_TRACK } = await import('./graphql/salesTrackQueries.js');
      
      // Execute the mutation
      const result = await this.mutate(UPDATE_SALES_TRACK, { id, input });
      return result.updateSalesTrack;
    } catch (error) {
      console.error('Error updating sales track:', error);
      throw error;
    }
  }

  /**
   * Create a sales drive
   * @param {Object} input - Sales drive data
   * @returns {Promise<Object>} Created sales drive
   */
  async createSalesDrive(input) {
    try {
      // Import the mutation
      const { CREATE_SALES_DRIVE } = await import('./graphql/salesTrackQueries.js');
      
      // Execute the mutation
      const result = await this.mutate(CREATE_SALES_DRIVE, { input });
      return result.createSalesDrive;
    } catch (error) {
      console.error('Error creating sales drive:', error);
      throw error;
    }
  }

  /**
   * Update a sales drive
   * @param {string} id - Sales drive ID
   * @param {Object} input - Updated sales drive data
   * @returns {Promise<Object>} Updated sales drive
   */
  async updateSalesDrive(id, input) {
    try {
      // Import the mutation
      const { UPDATE_SALES_DRIVE } = await import('./graphql/salesTrackQueries.js');
      
      // Execute the mutation
      const result = await this.mutate(UPDATE_SALES_DRIVE, { id, input });
      return result.updateSalesDrive;
    } catch (error) {
      console.error('Error updating sales drive:', error);
      throw error;
    }
  }

  /**
   * Create a sales stop
   * @param {Object} input - Sales stop data
   * @returns {Promise<Object>} Created sales stop
   */
  async createSalesStop(input) {
    try {
      // Import the mutation
      const { CREATE_SALES_STOP } = await import('./graphql/salesTrackQueries.js');
      
      // Execute the mutation
      const result = await this.mutate(CREATE_SALES_STOP, { input });
      return result.createSalesStop;
    } catch (error) {
      console.error('Error creating sales stop:', error);
      throw error;
    }
  }

  /**
   * Update a sales stop
   * @param {string} id - Sales stop ID
   * @param {Object} input - Updated sales stop data
   * @returns {Promise<Object>} Updated sales stop
   */
  async updateSalesStop(id, input) {
    try {
      // Import the mutation
      const { UPDATE_SALES_STOP } = await import('./graphql/salesTrackQueries.js');
      
      // Execute the mutation
      const result = await this.mutate(UPDATE_SALES_STOP, { id, input });
      return result.updateSalesStop;
    } catch (error) {
      console.error('Error updating sales stop:', error);
      throw error;
    }
  }

  /**
   * Move an entity between stops
   * @param {Object} input - Move data
   * @returns {Promise<Object>} Created touchpoint
   */
  async moveEntity(input) {
    try {
      // Import the mutation
      const { MOVE_ENTITY } = await import('./graphql/salesTrackQueries.js');
      
      // Execute the mutation
      const result = await this.mutate(MOVE_ENTITY, { input });
      return result.moveEntity;
    } catch (error) {
      console.error('Error moving entity:', error);
      throw error;
    }
  }

  /**
   * Create a touchpoint
   * @param {Object} input - Touchpoint data
   * @returns {Promise<Object>} Created touchpoint
   */
  async createTouchpoint(input) {
    try {
      // Import the mutation
      const { CREATE_TOUCHPOINT } = await import('./graphql/salesTrackQueries.js');
      
      // Execute the mutation
      const result = await this.mutate(CREATE_TOUCHPOINT, { input });
      return result.createTouchpoint;
    } catch (error) {
      console.error('Error creating touchpoint:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new GraphQLService();