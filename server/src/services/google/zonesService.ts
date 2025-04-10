import axios from 'axios';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

interface GooglePlaceDetails {
  place_id: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    viewport?: {
      northeast: {
        lat: number;
        lng: number;
      };
      southwest: {
        lat: number;
        lng: number;
      };
    };
    bounds?: {
      northeast: {
        lat: number;
        lng: number;
      };
      southwest: {
        lat: number;
        lng: number;
      };
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  name: string;
  types: string[];
  formatted_address: string;
}

export interface GeographicZone {
  id: string;
  parentId?: string;
  name: string;
  level: number;
  boundary?: any; // GeoJSON
  googlePlaceId?: string;
  placeType?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class GoogleZonesService {
  private pool: Pool;
  private apiKey: string;

  constructor(pool: Pool) {
    this.pool = pool;
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('Google Places API key not set. Google Zones service will not work.');
    }
  }

  /**
   * Import a geographic zone from Google Places API
   * 
   * @param placeId Google Place ID
   * @param parentId Optional parent zone ID
   * @returns Created zone ID
   */
  async importZoneFromGooglePlaceId(placeId: string, parentId?: string): Promise<string> {
    try {
      // Check if zone already exists with this place ID
      const existingZone = await this.getZoneByGooglePlaceId(placeId);
      if (existingZone) {
        return existingZone.id;
      }

      // Get place details from Google Places API
      const placeDetails = await this.getGooglePlaceDetails(placeId);
      
      // Create zone
      const level = this.determineLevelFromPlaceTypes(placeDetails.types);
      
      // Get boundary from Google Maps API (this would typically use the Maps API Geocoding service)
      const boundary = await this.getBoundaryForPlace(placeDetails);
      
      // Create zone record
      const zoneId = await this.createGeographicZone({
        name: placeDetails.name,
        level,
        googlePlaceId: placeId,
        placeType: placeDetails.types[0],
        parentId,
        boundary,
        metadata: {
          address_components: placeDetails.address_components,
          formatted_address: placeDetails.formatted_address,
          types: placeDetails.types
        }
      });

      return zoneId;
    } catch (error) {
      console.error('Error importing zone from Google Place ID:', error);
      throw error;
    }
  }

  /**
   * Get a zone by Google Place ID
   * 
   * @param placeId Google Place ID
   * @returns Zone object or null
   */
  async getZoneByGooglePlaceId(placeId: string): Promise<GeographicZone | null> {
    const query = `
      SELECT * FROM geographic_zones
      WHERE google_place_id = $1
      LIMIT 1
    `;

    try {
      const result = await this.pool.query(query, [placeId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapZoneFromDatabase(result.rows[0]);
    } catch (error) {
      console.error('Error getting zone by Google Place ID:', error);
      throw error;
    }
  }

  /**
   * Create a geographic zone
   * 
   * @param zoneData Zone data
   * @returns Created zone ID
   */
  async createGeographicZone(zoneData: {
    name: string;
    level: number;
    googlePlaceId?: string;
    placeType?: string;
    parentId?: string;
    boundary?: any;
    metadata?: Record<string, any>;
  }): Promise<string> {
    const id = uuidv4();
    const now = new Date();

    const query = `
      INSERT INTO geographic_zones (
        id, parent_id, name, level, boundary, google_place_id,
        place_type, metadata, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, ST_GeomFromGeoJSON($5), $6, $7, $8, $9, $9
      )
      RETURNING id
    `;

    const boundaryJson = zoneData.boundary 
      ? JSON.stringify(zoneData.boundary) 
      : null;
    
    const metadata = zoneData.metadata 
      ? JSON.stringify(zoneData.metadata) 
      : null;

    const values = [
      id,
      zoneData.parentId || null,
      zoneData.name,
      zoneData.level,
      boundaryJson,
      zoneData.googlePlaceId || null,
      zoneData.placeType || null,
      metadata,
      now
    ];

    try {
      const result = await this.pool.query(query, values);
      return result.rows[0].id;
    } catch (error) {
      console.error('Error creating geographic zone:', error);
      throw error;
    }
  }

  /**
   * Get Google Place details
   * 
   * @param placeId Google Place ID
   * @returns Place details
   */
  private async getGooglePlaceDetails(placeId: string): Promise<GooglePlaceDetails> {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`,
        {
          params: {
            place_id: placeId,
            fields: 'place_id,name,address_component,geometry,type,formatted_address',
            key: this.apiKey
          }
        }
      );

      if (response.data.status !== 'OK') {
        throw new Error(`Google Places API error: ${response.data.status}`);
      }

      return response.data.result;
    } catch (error) {
      console.error('Error getting Google Place details:', error);
      throw error;
    }
  }

  /**
   * Get boundary as GeoJSON for a place
   * 
   * @param placeDetails Place details from Google Places API
   * @returns GeoJSON Polygon
   */
  private async getBoundaryForPlace(placeDetails: GooglePlaceDetails): Promise<any> {
    // For a production implementation, you would:
    // 1. Use Maps API Geocoding to get detailed boundary
    // 2. Or use a boundary data provider like OpenStreetMap
    // 3. Or create an approximation using the viewport/bounds data
    
    // For this implementation, we'll create a simple approximation from viewport
    const viewport = placeDetails.geometry.viewport || placeDetails.geometry.bounds;
    
    if (!viewport) {
      // If no viewport/bounds, create a small polygon around the location
      const lat = placeDetails.geometry.location.lat;
      const lng = placeDetails.geometry.location.lng;
      const delta = 0.01; // ~1km
      
      return {
        type: 'Polygon',
        coordinates: [[
          [lng - delta, lat - delta],
          [lng + delta, lat - delta],
          [lng + delta, lat + delta],
          [lng - delta, lat + delta],
          [lng - delta, lat - delta] // Close the polygon
        ]]
      };
    }
    
    // Create polygon from viewport
    return {
      type: 'Polygon',
      coordinates: [[
        [viewport.southwest.lng, viewport.southwest.lat],
        [viewport.northeast.lng, viewport.southwest.lat],
        [viewport.northeast.lng, viewport.northeast.lat],
        [viewport.southwest.lng, viewport.northeast.lat],
        [viewport.southwest.lng, viewport.southwest.lat] // Close the polygon
      ]]
    };
  }

  /**
   * Determine zone level from place types
   * 
   * @param types Google place types
   * @returns Level number (1-5)
   */
  private determineLevelFromPlaceTypes(types: string[]): number {
    if (types.includes('country')) {
      return 1;
    } else if (types.includes('administrative_area_level_1')) {
      return 2;
    } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
      return 3;
    } else if (types.includes('neighborhood') || types.includes('sublocality')) {
      return 4;
    } else {
      return 5;
    }
  }

  /**
   * Get all zones at a specific level
   * 
   * @param level Zone level (1-5)
   * @returns Array of zones
   */
  async getZonesByLevel(level: number): Promise<GeographicZone[]> {
    const query = `
      SELECT * FROM geographic_zones
      WHERE level = $1
      ORDER BY name
    `;

    try {
      const result = await this.pool.query(query, [level]);
      return result.rows.map(this.mapZoneFromDatabase);
    } catch (error) {
      console.error('Error getting zones by level:', error);
      throw error;
    }
  }

  /**
   * Get child zones for a parent zone
   * 
   * @param parentId Parent zone ID
   * @returns Array of child zones
   */
  async getChildZones(parentId: string): Promise<GeographicZone[]> {
    const query = `
      SELECT * FROM geographic_zones
      WHERE parent_id = $1
      ORDER BY name
    `;

    try {
      const result = await this.pool.query(query, [parentId]);
      return result.rows.map(this.mapZoneFromDatabase);
    } catch (error) {
      console.error('Error getting child zones:', error);
      throw error;
    }
  }

  /**
   * Find zones that contain a point
   * 
   * @param lat Latitude
   * @param lng Longitude
   * @returns Array of zones containing the point
   */
  async findZonesContainingPoint(lat: number, lng: number): Promise<GeographicZone[]> {
    const query = `
      SELECT * FROM geographic_zones
      WHERE ST_Contains(boundary, ST_SetSRID(ST_MakePoint($1, $2), 4326))
      ORDER BY level DESC
    `;

    try {
      const result = await this.pool.query(query, [lng, lat]); // Note: lng first, then lat for PostGIS
      return result.rows.map(this.mapZoneFromDatabase);
    } catch (error) {
      console.error('Error finding zones containing point:', error);
      throw error;
    }
  }

  /**
   * Map database zone record to GeographicZone interface
   * 
   * @param dbZone Database zone record
   * @returns GeographicZone object
   */
  private mapZoneFromDatabase(dbZone: any): GeographicZone {
    return {
      id: dbZone.id,
      parentId: dbZone.parent_id,
      name: dbZone.name,
      level: dbZone.level,
      boundary: dbZone.boundary,
      googlePlaceId: dbZone.google_place_id,
      placeType: dbZone.place_type,
      metadata: dbZone.metadata,
      createdAt: dbZone.created_at,
      updatedAt: dbZone.updated_at
    };
  }
}