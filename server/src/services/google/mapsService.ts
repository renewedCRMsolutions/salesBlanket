// server/src/services/google/mapsService.ts
import axios from 'axios';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  formattedAddress: string;
  placeId: string;
  location: LatLng;
  addressComponents: Array<{
    longName: string;
    shortName: string;
    types: string[];
  }>;
  bounds?: {
    northeast: LatLng;
    southwest: LatLng;
  };
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  location: LatLng;
  photos?: Array<{
    photoReference: string;
    width: number;
    height: number;
  }>;
  placeTypes: string[];
  addressComponents: Array<{
    longName: string;
    shortName: string;
    types: string[];
  }>;
  boundary?: any; // GeoJSON polygon
}

export interface AddressFromPolygon {
  placeId: string;
  formattedAddress: string;
  location: LatLng;
}

export class GoogleMapsService {
  private pool: Pool;
  private apiKey: string;

  constructor(pool: Pool) {
    this.pool = pool;
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';

    if (!this.apiKey) {
      console.warn('Google Maps API key not set. Google Maps service will not work.');
    }
  }

  /**
   * Geocode an address to coordinates
   * @param address - Address to geocode
   * @returns Geocoding result
   */
  async geocodeAddress(address: string): Promise<GeocodingResult | null> {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address,
          key: this.apiKey,
        },
      });

      if (response.data.status !== 'OK' || response.data.results.length === 0) {
        console.warn(`Geocoding error: ${response.data.status}`);
        return null;
      }

      const result = response.data.results[0];

      // Map to our interface
      return {
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
        location: result.geometry.location,
        addressComponents: result.address_components.map((component: any) => ({
          longName: component.long_name,
          shortName: component.short_name,
          types: component.types,
        })),
        bounds: result.geometry.bounds
          ? {
              northeast: result.geometry.bounds.northeast,
              southwest: result.geometry.bounds.southwest,
            }
          : undefined,
      };
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to address
   * @param lat - Latitude
   * @param lng - Longitude
   * @returns Geocoding result
   */
  async reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          latlng: `${lat},${lng}`,
          key: this.apiKey,
        },
      });

      if (response.data.status !== 'OK' || response.data.results.length === 0) {
        console.warn(`Reverse geocoding error: ${response.data.status}`);
        return null;
      }

      const result = response.data.results[0];

      // Map to our interface
      return {
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
        location: result.geometry.location,
        addressComponents: result.address_components.map((component: any) => ({
          longName: component.long_name,
          shortName: component.short_name,
          types: component.types,
        })),
        bounds: result.geometry.bounds
          ? {
              northeast: result.geometry.bounds.northeast,
              southwest: result.geometry.bounds.southwest,
            }
          : undefined,
      };
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  /**
   * Get place details
   * @param placeId - Google Place ID
   * @returns Place details
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
        params: {
          place_id: placeId,
          fields: 'place_id,name,formatted_address,geometry,photo,type,address_component',
          key: this.apiKey,
        },
      });

      if (response.data.status !== 'OK') {
        console.warn(`Place details error: ${response.data.status}`);
        return null;
      }

      const result = response.data.result;

      // Map to our interface
      return {
        placeId: result.place_id,
        name: result.name,
        formattedAddress: result.formatted_address,
        location: result.geometry.location,
        photos: result.photos
          ? result.photos.map((photo: any) => ({
              photoReference: photo.photo_reference,
              width: photo.width,
              height: photo.height,
            }))
          : undefined,
        placeTypes: result.types,
        addressComponents: result.address_components.map((component: any) => ({
          longName: component.long_name,
          shortName: component.short_name,
          types: component.types,
        })),
        boundary: this.createBoundaryFromViewport(result.geometry),
      };
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }

  /**
   * Create boundary polygon from viewport
   * @param geometry - Google Maps geometry object
   * @returns GeoJSON Polygon
   */
  private createBoundaryFromViewport(geometry: any): any {
    // Use viewport or bounds if available
    const viewport = geometry.viewport || geometry.bounds;

    if (!viewport) {
      // Create small polygon around location
      const lat = geometry.location.lat;
      const lng = geometry.location.lng;
      const delta = 0.01; // ~1km

      return {
        type: 'Polygon',
        coordinates: [
          [
            [lng - delta, lat - delta],
            [lng + delta, lat - delta],
            [lng + delta, lat + delta],
            [lng - delta, lat + delta],
            [lng - delta, lat - delta], // Close the polygon
          ],
        ],
      };
    }

    // Create polygon from viewport
    return {
      type: 'Polygon',
      coordinates: [
        [
          [viewport.southwest.lng, viewport.southwest.lat],
          [viewport.northeast.lng, viewport.southwest.lat],
          [viewport.northeast.lng, viewport.northeast.lat],
          [viewport.southwest.lng, viewport.northeast.lat],
          [viewport.southwest.lng, viewport.southwest.lat], // Close the polygon
        ],
      ],
    };
  }

  /**
   * Get photo URL from photo reference
   * @param photoReference - Google photo reference
   * @param maxWidth - Maximum width of the photo
   * @returns Photo URL
   */
  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${this.apiKey}`;
  }

  /**
   * Find addresses within a polygon
   * @param polygon - Array of LatLng points defining the polygon vertices
   * @returns Array of addresses within the polygon
   */
  async findAddressesInPolygon(polygon: LatLng[]): Promise<AddressFromPolygon[]> {
    // This is a complex operation that would typically require:
    // 1. Converting the polygon to a format compatible with the Google Maps API
    // 2. Using the Google Maps Roads API to find roads within the polygon
    // 3. Using the Places API to find addresses along those roads

    // For this example, we'll use a simplified approach by:
    // 1. Finding the center of the polygon
    // 2. Using the Places API to find addresses near that center
    // 3. Filtering addresses that are within the polygon

    try {
      // Calculate polygon center
      const center = this.calculatePolygonCenter(polygon);

      // Search for addresses near the center
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        {
          params: {
            location: `${center.lat},${center.lng}`,
            radius: 1000, // 1km radius
            type: 'address',
            key: this.apiKey,
          },
        }
      );

      if (response.data.status !== 'OK') {
        console.warn(`Nearby search error: ${response.data.status}`);
        return [];
      }

      // Filter places that are within the polygon
      const addresses: AddressFromPolygon[] = [];

      for (const place of response.data.results) {
        const location = {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        };

        if (this.isPointInPolygon(location, polygon)) {
          addresses.push({
            placeId: place.place_id,
            formattedAddress: place.vicinity || place.name,
            location,
          });
        }
      }

      return addresses;
    } catch (error) {
      console.error('Error finding addresses in polygon:', error);
      return [];
    }
  }

  /**
   * Calculate center of a polygon
   * @param polygon - Array of points
   * @returns Center point
   */
  private calculatePolygonCenter(polygon: LatLng[]): LatLng {
    let lat = 0;
    let lng = 0;

    polygon.forEach((point) => {
      lat += point.lat;
      lng += point.lng;
    });

    return {
      lat: lat / polygon.length,
      lng: lng / polygon.length,
    };
  }

  /**
   * Check if a point is inside a polygon
   * @param point - The point to check
   * @param polygon - Array of points defining the polygon
   * @returns Boolean indicating if the point is in the polygon
   */
  private isPointInPolygon(point: LatLng, polygon: LatLng[]): boolean {
    // Ray casting algorithm to determine if point is in polygon
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng;
      const yi = polygon[i].lat;
      const xj = polygon[j].lng;
      const yj = polygon[j].lat;

      const intersect =
        yi > point.lat !== yj > point.lat &&
        point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;

      if (intersect) inside = !inside;
    }

    return inside;
  }

  /**
   * Save addresses to database
   * @param addresses - Array of addresses to save
   * @param zoneId - Optional zone ID to associate addresses with
   * @returns Array of saved address IDs
   */
  async saveAddressesToDatabase(
    addresses: AddressFromPolygon[],
    zoneId?: string
  ): Promise<string[]> {
    const savedIds: string[] = [];

    for (const address of addresses) {
      try {
        // Get more details about the address
        const details = await this.getPlaceDetails(address.placeId);

        if (!details) continue;

        // Extract address components
        const street = this.getAddressComponent(details.addressComponents, 'route');
        const streetNumber = this.getAddressComponent(details.addressComponents, 'street_number');
        const city =
          this.getAddressComponent(details.addressComponents, 'locality') ||
          this.getAddressComponent(details.addressComponents, 'administrative_area_level_2');
        const state = this.getAddressComponent(
          details.addressComponents,
          'administrative_area_level_1'
        );
        const postalCode = this.getAddressComponent(details.addressComponents, 'postal_code');
        const country = this.getAddressComponent(details.addressComponents, 'country');

        // Create address in database
        const id = uuidv4();
        const now = new Date();

        const query = `
          INSERT INTO addresses (
            id, name, street, address_line_2, city, state, postal_code,
            country, status, location_geo, google_place_id, google_place_data,
            created_at, updated_at
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9,
            ST_SetSRID(ST_MakePoint($10, $11), 4326),
            $12, $13, $14, $14
          )
          ON CONFLICT (google_place_id) DO UPDATE SET
            name = $2,
            street = $3,
            city = $5,
            state = $6,
            postal_code = $7,
            country = $8,
            google_place_data = $13,
            updated_at = $14
          RETURNING id
        `;

        const values = [
          id,
          `${streetNumber ? streetNumber + ' ' : ''}${street || ''}`.trim(),
          `${streetNumber ? streetNumber + ' ' : ''}${street || ''}`.trim(),
          '',
          city || '',
          state || '',
          postalCode || '',
          country || '',
          'ACTIVE',
          address.location.lng, // PostGIS expects longitude first
          address.location.lat,
          address.placeId,
          JSON.stringify(details),
          now,
        ];

        const result = await this.pool.query(query, values);
        const addressId = result.rows[0].id;

        // Link to zone if provided
        if (zoneId) {
          const linkQuery = `
            INSERT INTO entity_zones (
              id, entity_id, zone_id, relationship_type, is_primary,
              created_at, updated_at
            )
            VALUES (
              $1, $2, $3, 'ADDRESS', TRUE, $4, $4
            )
            ON CONFLICT (entity_id, zone_id) DO NOTHING
          `;

          await this.pool.query(linkQuery, [uuidv4(), addressId, zoneId, now]);
        }

        savedIds.push(addressId);
      } catch (error) {
        console.error('Error saving address to database:', error);
        continue;
      }
    }

    return savedIds;
  }

  /**
   * Get value from address components
   * @param components - Address components
   * @param type - Component type to get
   * @returns Component value or empty string
   */
  private getAddressComponent(
    components: Array<{ longName: string; shortName: string; types: string[] }>,
    type: string
  ): string {
    const component = components.find((c) => c.types.includes(type));
    return component ? component.longName : '';
  }
}
