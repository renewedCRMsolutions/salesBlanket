// server/src/services/google/contactsService.ts
import axios from 'axios';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { GoogleAuthService } from './googleAuthService';

export interface GoogleContact {
  resourceName: string;
  etag: string;
  names?: Array<{
    displayName: string;
    familyName: string;
    givenName: string;
    middleName?: string;
    metadata: {
      primary: boolean;
      source: {
        type: string;
        id?: string;
      };
    };
  }>;
  emailAddresses?: Array<{
    value: string;
    type?: string;
    metadata: {
      primary: boolean;
      source: {
        type: string;
        id?: string;
      };
    };
  }>;
  phoneNumbers?: Array<{
    value: string;
    type?: string;
    metadata: {
      primary: boolean;
      source: {
        type: string;
        id?: string;
      };
    };
  }>;
  photos?: Array<{
    url: string;
    metadata: {
      primary: boolean;
      source: {
        type: string;
        id?: string;
      };
    };
  }>;
  addresses?: Array<{
    streetAddress?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
    type?: string;
    metadata: {
      primary: boolean;
      source: {
        type: string;
        id?: string;
      };
    };
  }>;
  organizations?: Array<{
    name?: string;
    title?: string;
    metadata: {
      primary: boolean;
      source: {
        type: string;
        id?: string;
      };
    };
  }>;
  metadata: {
    sources: Array<{
      type: string;
      id?: string;
      etag?: string;
      updateTime?: string;
    }>;
  };
}

export interface SyncStats {
  added: number;
  updated: number;
  deleted: number;
  skipped: number;
  errors: number;
}

export class GoogleContactsService {
  private pool: Pool;
  private authService: GoogleAuthService;
  private peopleApiUrl: string = 'https://people.googleapis.com/v1';
  private saleblankSourceType: string = 'SALESBLANKET_CONTACT';

  constructor(pool: Pool) {
    this.pool = pool;
    this.authService = new GoogleAuthService(pool);
  }

  /**
   * Get all Google contacts for a user
   * @param userId - User ID
   * @returns Array of Google contacts
   */
  async listGoogleContacts(userId: string): Promise<GoogleContact[]> {
    // Get valid tokens
    const tokens = await this.authService.getValidTokensForUser(userId);
    
    if (!tokens) {
      throw new Error('User is not authenticated with Google');
    }
    
    try {
      const response = await axios.get(
        `${this.peopleApiUrl}/people/me/connections`,
        {
          params: {
            personFields: 'names,emailAddresses,phoneNumbers,photos,addresses,organizations,metadata',
            pageSize: 1000 // Google maximum
          },
          headers: {
            Authorization: `Bearer ${tokens.access_token}`
          }
        }
      );

      return response.data.connections || [];
    } catch (error) {
      console.error('Error listing Google contacts:', error);
      throw new Error('Failed to list Google contacts');
    }
  }

  /**
   * Get a single Google contact
   * @param userId - User ID
   * @param resourceName - Google contact resource name
   * @returns Google contact
   */
  async getGoogleContact(userId: string, resourceName: string): Promise<GoogleContact | null> {
    // Get valid tokens
    const tokens = await this.authService.getValidTokensForUser(userId);
    
    if (!tokens) {
      throw new Error('User is not authenticated with Google');
    }
    
    try {
      const response = await axios.get(
        `${this.peopleApiUrl}/${resourceName}`,
        {
          params: {
            personFields: 'names,emailAddresses,phoneNumbers,photos,addresses,organizations,metadata'
          },
          headers: {
            Authorization: `Bearer ${tokens.access_token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting Google contact:', error);
      return null;
    }
  }

  /**
   * Create a new Google contact
   * @param userId - User ID
   * @param contactData - Contact data
   * @returns Created Google contact
   */
  async createGoogleContact(
    userId: string,
    contactData: {
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
      };
      organization?: {
        name?: string;
        title?: string;
      };
      salesblanketId: string;
    }
  ): Promise<GoogleContact> {
    // Get valid tokens
    const tokens = await this.authService.getValidTokensForUser(userId);
    
    if (!tokens) {
      throw new Error('User is not authenticated with Google');
    }
    
    // Prepare contact data
    const contactBody: any = {
      names: [
        {
          givenName: contactData.firstName,
          familyName: contactData.lastName
        }
      ],
      sources: [
        {
          type: this.saleblankSourceType,
          id: contactData.salesblanketId
        }
      ]
    };
    
    // Add email if provided
    if (contactData.email) {
      contactBody.emailAddresses = [
        {
          value: contactData.email,
          type: 'work'
        }
      ];
    }
    
    // Add phone if provided
    if (contactData.phone) {
      contactBody.phoneNumbers = [
        {
          value: contactData.phone,
          type: 'work'
        }
      ];
    }
    
    // Add address if provided
    if (contactData.address) {
      const address: any = {
        type: 'work'
      };
      
      if (contactData.address.street) address.streetAddress = contactData.address.street;
      if (contactData.address.city) address.city = contactData.address.city;
      if (contactData.address.state) address.region = contactData.address.state;
      if (contactData.address.postalCode) address.postalCode = contactData.address.postalCode;
      if (contactData.address.country) address.country = contactData.address.country;
      
      contactBody.addresses = [address];
    }
    
    // Add organization if provided
    if (contactData.organization) {
      const organization: any = {};
      
      if (contactData.organization.name) organization.name = contactData.organization.name;
      if (contactData.organization.title) organization.title = contactData.organization.title;
      
      contactBody.organizations = [organization];
    }
    
    try {
      const response = await axios.post(
        `${this.peopleApiUrl}/people:createContact`,
        contactBody,
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating Google contact:', error);
      throw new Error('Failed to create Google contact');
    }
  }

  /**
   * Update an existing Google contact
   * @param userId - User ID
   * @param resourceName - Google contact resource name
   * @param contactData - Updated contact data
   * @param etag - Contact etag
   * @returns Updated Google contact
   */
  async updateGoogleContact(
    userId: string,
    resourceName: string,
    contactData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
      };
      organization?: {
        name?: string;
        title?: string;
      };
    },
    etag: string
  ): Promise<GoogleContact> {
    // Get valid tokens
    const tokens = await this.authService.getValidTokensForUser(userId);
    
    if (!tokens) {
      throw new Error('User is not authenticated with Google');
    }
    
    // Prepare update mask (fields to update)
    const updateMask: string[] = [];
    const contactBody: any = {};
    
    // Add name if provided
    if (contactData.firstName || contactData.lastName) {
      contactBody.names = [
        {
          givenName: contactData.firstName,
          familyName: contactData.lastName
        }
      ];
      updateMask.push('names');
    }
    
    // Add email if provided
    if (contactData.email) {
      contactBody.emailAddresses = [
        {
          value: contactData.email,
          type: 'work'
        }
      ];
      updateMask.push('emailAddresses');
    }
    
    // Add phone if provided
    if (contactData.phone) {
      contactBody.phoneNumbers = [
        {
          value: contactData.phone,
          type: 'work'
        }
      ];
      updateMask.push('phoneNumbers');
    }
    
    // Add address if provided
    if (contactData.address) {
      const address: any = {
        type: 'work'
      };
      
      if (contactData.address.street) address.streetAddress = contactData.address.street;
      if (contactData.address.city) address.city = contactData.address.city;
      if (contactData.address.state) address.region = contactData.address.state;
      if (contactData.address.postalCode) address.postalCode = contactData.address.postalCode;
      if (contactData.address.country) address.country = contactData.address.country;
      
      contactBody.addresses = [address];
      updateMask.push('addresses');
    }
    
    // Add organization if provided
    if (contactData.organization) {
      const organization: any = {};
      
      if (contactData.organization.name) organization.name = contactData.organization.name;
      if (contactData.organization.title) organization.title = contactData.organization.title;
      
      contactBody.organizations = [organization];
      updateMask.push('organizations');
    }
    
    try {
      const response = await axios.patch(
        `${this.peopleApiUrl}/${resourceName}`,
        contactBody,
        {
          params: {
            updatePersonFields: updateMask.join(',')
          },
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            'Content-Type': 'application/json',
            'If-Match': etag
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error updating Google contact:', error);
      throw new Error('Failed to update Google contact');
    }
  }

  /**
   * Delete a Google contact
   * @param userId - User ID
   * @param resourceName - Google contact resource name
   * @returns Boolean indicating success
   */
  async deleteGoogleContact(userId: string, resourceName: string): Promise<boolean> {
    // Get valid tokens
    const tokens = await this.authService.getValidTokensForUser(userId);
    
    if (!tokens) {
      throw new Error('User is not authenticated with Google');
    }
    
    try {
      await axios.delete(
        `${this.peopleApiUrl}/${resourceName}`,
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`
          }
        }
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting Google contact:', error);
      throw new Error('Failed to delete Google contact');
    }
  }

  /**
   * Sync contacts between SalesBlanket and Google
   * @param userId - User ID
   * @param direction - Sync direction ('to_google', 'from_google', 'bidirectional')
   * @returns Sync statistics
   */
  async syncContacts(userId: string, direction: 'to_google' | 'from_google' | 'bidirectional' = 'bidirectional'): Promise<SyncStats> {
    const stats: SyncStats = {
      added: 0,
      updated: 0,
      deleted: 0,
      skipped: 0,
      errors: 0
    };
    
    try {
      // 1. Get all Google contacts
      const googleContacts = await this.listGoogleContacts(userId);
      
      // 2. Get all SalesBlanket contacts
      const contactsQuery = `
        SELECT c.id, c.first_name, c.last_name, c.email, 
               c.phone, c.facebook, c.linkedin, c.x,
               c.contact_type_id, c.status, c.updated_at,
               c.google_resource_name, c.google_etag, c.last_synced_at
        FROM contacts c
        WHERE c.created_by = $1
        ORDER BY c.updated_at DESC
      `;
      
      const contactsResult = await this.pool.query(contactsQuery, [userId]);
      const salesblanketContacts = contactsResult.rows;