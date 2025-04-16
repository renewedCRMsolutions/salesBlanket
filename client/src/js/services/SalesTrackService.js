/**
 * SalesTrackService.js
 * 
 * Service for managing the Sales Track system.
 * Interacts with the GraphQL API to fetch and update track data.
 */

import GraphQLService from './GraphQLService.js';

class SalesTrackService {
  static instance = null;

  constructor() {
    if (SalesTrackService.instance) {
      return SalesTrackService.instance;
    }
    
    SalesTrackService.instance = this;
    this.graphQLService = GraphQLService;
    
    // Cache of currently loaded data
    this.currentTrack = null;
    this.currentDrive = null;
    this.currentStop = null;
    this.cachedTracks = new Map();
    this.cachedDrives = new Map();
    this.cachedStops = new Map();
  }

  /**
   * Get all available sales tracks
   * @param {Object} filter - Optional filter criteria
   * @param {number} limit - Results limit
   * @param {number} offset - Pagination offset
   * @returns {Promise<Array>} Sales tracks
   */
  async getTracks(filter = {}, limit = 20, offset = 0) {
    try {
      return await this.graphQLService.getSalesTracks(filter, limit, offset);
    } catch (error) {
      console.error('Error in SalesTrackService.getTracks:', error);
      throw error;
    }
  }

  /**
   * Get a specific track by ID
   * @param {string} trackId - Track ID
   * @returns {Promise<Object>} Track details
   */
  async getTrack(trackId) {
    try {
      // Check cache first
      if (this.cachedTracks.has(trackId)) {
        return this.cachedTracks.get(trackId);
      }
      
      const track = await this.graphQLService.getSalesTrack(trackId);
      
      if (track) {
        // Update cache
        this.cachedTracks.set(trackId, track);
        this.currentTrack = track;
      }
      
      return track;
    } catch (error) {
      console.error('Error in SalesTrackService.getTrack:', error);
      throw error;
    }
  }

  /**
   * Get all drives for a track
   * @param {string} trackId - Track ID 
   * @param {Object} filter - Additional filter criteria
   * @returns {Promise<Array>} Sales drives
   */
  async getDrives(trackId, filter = {}) {
    try {
      // Combine trackId with other filters
      const driveFilter = { 
        ...filter,
        trackIds: [trackId]
      };
      
      return await this.graphQLService.getSalesDrives(driveFilter);
    } catch (error) {
      console.error('Error in SalesTrackService.getDrives:', error);
      throw error;
    }
  }

  /**
   * Get a specific drive by ID
   * @param {string} driveId - Drive ID
   * @returns {Promise<Object>} Drive details
   */
  async getDrive(driveId) {
    try {
      // Check cache first
      if (this.cachedDrives.has(driveId)) {
        return this.cachedDrives.get(driveId);
      }
      
      const drive = await this.graphQLService.getSalesDrive(driveId);
      
      if (drive) {
        // Update cache
        this.cachedDrives.set(driveId, drive);
        this.currentDrive = drive;
      }
      
      return drive;
    } catch (error) {
      console.error('Error in SalesTrackService.getDrive:', error);
      throw error;
    }
  }

  /**
   * Get all stops for a drive
   * @param {string} driveId - Drive ID
   * @param {Object} filter - Additional filter criteria
   * @returns {Promise<Array>} Sales stops
   */
  async getStops(driveId, filter = {}) {
    try {
      // Combine driveId with other filters
      const stopFilter = {
        ...filter,
        driveIds: [driveId]
      };
      
      return await this.graphQLService.getSalesStops(stopFilter);
    } catch (error) {
      console.error('Error in SalesTrackService.getStops:', error);
      throw error;
    }
  }

  /**
   * Get a specific stop by ID
   * @param {string} stopId - Stop ID
   * @returns {Promise<Object>} Stop details
   */
  async getStop(stopId) {
    try {
      // Check cache first
      if (this.cachedStops.has(stopId)) {
        return this.cachedStops.get(stopId);
      }
      
      const stop = await this.graphQLService.getSalesStop(stopId);
      
      if (stop) {
        // Update cache
        this.cachedStops.set(stopId, stop);
        this.currentStop = stop;
      }
      
      return stop;
    } catch (error) {
      console.error('Error in SalesTrackService.getStop:', error);
      throw error;
    }
  }

  /**
   * Get entities for a specific stop
   * @param {string} stopId - Stop ID
   * @param {Object} filter - Entity filter criteria
   * @param {number} limit - Results limit
   * @param {number} offset - Pagination offset
   * @returns {Promise<Array>} Entities in the stop
   */
  async getStopEntities(stopId, filter = {}, limit = 10, offset = 0) {
    try {
      return await this.graphQLService.getSalesStopEntities(stopId, filter, limit, offset);
    } catch (error) {
      console.error('Error in SalesTrackService.getStopEntities:', error);
      throw error;
    }
  }

  /**
   * Get available touchpoint types
   * @returns {Promise<Array>} Touchpoint types
   */
  async getTouchpointTypes() {
    try {
      return await this.graphQLService.getTouchpointTypes();
    } catch (error) {
      console.error('Error in SalesTrackService.getTouchpointTypes:', error);
      throw error;
    }
  }

  /**
   * Get touchpoint codes for a stop type
   * @param {string} stopTypeId - Stop type ID
   * @returns {Promise<Array>} Touchpoint codes
   */
  async getTouchpointCodes(stopTypeId) {
    try {
      return await this.graphQLService.getTouchpointCodes(stopTypeId);
    } catch (error) {
      console.error('Error in SalesTrackService.getTouchpointCodes:', error);
      throw error;
    }
  }

  /**
   * Get touchpoint history for an entity
   * @param {string} entityId - Entity ID
   * @param {string} entityTypeId - Entity type ID
   * @returns {Promise<Array>} Touchpoint history
   */
  async getEntityTouchpointHistory(entityId, entityTypeId) {
    try {
      return await this.graphQLService.getEntityTouchpointHistory(entityId, entityTypeId);
    } catch (error) {
      console.error('Error in SalesTrackService.getEntityTouchpointHistory:', error);
      throw error;
    }
  }

  /**
   * Create a new sales track
   * @param {Object} trackData - Track data
   * @returns {Promise<Object>} Created track
   */
  async createTrack(trackData) {
    try {
      const result = await this.graphQLService.createSalesTrack(trackData);
      
      // Clear track cache
      this.cachedTracks.clear();
      
      return result;
    } catch (error) {
      console.error('Error in SalesTrackService.createTrack:', error);
      throw error;
    }
  }

  /**
   * Update an existing sales track
   * @param {string} trackId - Track ID
   * @param {Object} trackData - Updated track data
   * @returns {Promise<Object>} Updated track
   */
  async updateTrack(trackId, trackData) {
    try {
      const result = await this.graphQLService.updateSalesTrack(trackId, trackData);
      
      // Update cache
      if (result) {
        this.cachedTracks.set(trackId, result);
        if (this.currentTrack && this.currentTrack.id === trackId) {
          this.currentTrack = result;
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error in SalesTrackService.updateTrack:', error);
      throw error;
    }
  }

  /**
   * Create a new sales drive
   * @param {Object} driveData - Drive data
   * @returns {Promise<Object>} Created drive
   */
  async createDrive(driveData) {
    try {
      const result = await this.graphQLService.createSalesDrive(driveData);
      
      // Clear drive cache
      this.cachedDrives.clear();
      
      // Also invalidate the parent track in cache
      if (result && result.salesTrackId) {
        this.cachedTracks.delete(result.salesTrackId);
      }
      
      return result;
    } catch (error) {
      console.error('Error in SalesTrackService.createDrive:', error);
      throw error;
    }
  }

  /**
   * Update an existing sales drive
   * @param {string} driveId - Drive ID
   * @param {Object} driveData - Updated drive data
   * @returns {Promise<Object>} Updated drive
   */
  async updateDrive(driveId, driveData) {
    try {
      const result = await this.graphQLService.updateSalesDrive(driveId, driveData);
      
      // Update cache
      if (result) {
        this.cachedDrives.set(driveId, result);
        if (this.currentDrive && this.currentDrive.id === driveId) {
          this.currentDrive = result;
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error in SalesTrackService.updateDrive:', error);
      throw error;
    }
  }

  /**
   * Create a new sales stop
   * @param {Object} stopData - Stop data
   * @returns {Promise<Object>} Created stop
   */
  async createStop(stopData) {
    try {
      const result = await this.graphQLService.createSalesStop(stopData);
      
      // Clear stop cache
      this.cachedStops.clear();
      
      // Also invalidate the parent drive in cache
      if (result && result.salesDriveId) {
        this.cachedDrives.delete(result.salesDriveId);
      }
      
      return result;
    } catch (error) {
      console.error('Error in SalesTrackService.createStop:', error);
      throw error;
    }
  }

  /**
   * Update an existing sales stop
   * @param {string} stopId - Stop ID
   * @param {Object} stopData - Updated stop data
   * @returns {Promise<Object>} Updated stop
   */
  async updateStop(stopId, stopData) {
    try {
      const result = await this.graphQLService.updateSalesStop(stopId, stopData);
      
      // Update cache
      if (result) {
        this.cachedStops.set(stopId, result);
        if (this.currentStop && this.currentStop.id === stopId) {
          this.currentStop = result;
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error in SalesTrackService.updateStop:', error);
      throw error;
    }
  }

  /**
   * Move an entity between stops
   * @param {string} entityId - Entity ID
   * @param {string} entityTypeId - Entity type ID
   * @param {string} fromStopId - Source stop ID
   * @param {string} toStopId - Destination stop ID
   * @param {string} touchpointCodeId - Optional touchpoint code ID
   * @param {string} notes - Optional notes
   * @returns {Promise<Object>} Result of the move
   */
  async moveEntity(entityId, entityTypeId, fromStopId, toStopId, touchpointCodeId = null, notes = null) {
    try {
      const input = {
        entityId,
        entityTypeId,
        fromStopId,
        toStopId,
        touchpointCodeId,
        notes
      };
      
      return await this.graphQLService.moveEntity(input);
    } catch (error) {
      console.error('Error in SalesTrackService.moveEntity:', error);
      throw error;
    }
  }

  /**
   * Add a touchpoint to an entity
   * @param {string} entityId - Entity ID
   * @param {string} entityTypeId - Entity type ID
   * @param {string} touchpointCodeId - Touchpoint code ID
   * @param {string} notes - Optional notes
   * @param {string} status - Optional status
   * @returns {Promise<Object>} Created touchpoint
   */
  async addTouchpoint(entityId, entityTypeId, touchpointCodeId, notes = null, status = null) {
    try {
      const input = {
        entityId,
        entityTypeId,
        touchpointCodeId,
        notes,
        status
      };
      
      return await this.graphQLService.createTouchpoint(input);
    } catch (error) {
      console.error('Error in SalesTrackService.addTouchpoint:', error);
      throw error;
    }
  }

  /**
   * Clear service cache
   */
  clearCache() {
    this.cachedTracks.clear();
    this.cachedDrives.clear();
    this.cachedStops.clear();
    this.currentTrack = null;
    this.currentDrive = null;
    this.currentStop = null;
  }
}

// Export singleton instance
export default new SalesTrackService();