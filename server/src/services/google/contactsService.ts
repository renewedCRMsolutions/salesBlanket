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
      const response = await axios.get(`${this.peopleApiUrl}/people/me/connections`, {
        params: {
          personFields: 'names,emailAddresses,phoneNumbers,photos,addresses,organizations,metadata',
          pageSize: 1000, // Google maximum
        },
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

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
      const response = await axios.get(`${this.peopleApiUrl}/${resourceName}`, {
        params: {
          personFields: 'names,emailAddresses,phoneNumbers,photos,addresses,organizations,metadata',
        },
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

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
          familyName: contactData.lastName,
        },
      ],
      sources: [
        {
          type: this.saleblankSourceType,
          id: contactData.salesblanketId,
        },
      ],
    };

    // Add email if provided
    if (contactData.email) {
      contactBody.emailAddresses = [
        {
          value: contactData.email,
          type: 'work',
        },
      ];
    }

    // Add phone if provided
    if (contactData.phone) {
      contactBody.phoneNumbers = [
        {
          value: contactData.phone,
          type: 'work',
        },
      ];
    }

    // Add address if provided
    if (contactData.address) {
      const address: any = {
        type: 'work',
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
      const response = await axios.post(`${this.peopleApiUrl}/people:createContact`, contactBody, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
        },
      });

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
          familyName: contactData.lastName,
        },
      ];
      updateMask.push('names');
    }

    // Add email if provided
    if (contactData.email) {
      contactBody.emailAddresses = [
        {
          value: contactData.email,
          type: 'work',
        },
      ];
      updateMask.push('emailAddresses');
    }

    // Add phone if provided
    if (contactData.phone) {
      contactBody.phoneNumbers = [
        {
          value: contactData.phone,
          type: 'work',
        },
      ];
      updateMask.push('phoneNumbers');
    }

    // Add address if provided
    if (contactData.address) {
      const address: any = {
        type: 'work',
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
      const response = await axios.patch(`${this.peopleApiUrl}/${resourceName}`, contactBody, {
        params: {
          updatePersonFields: updateMask.join(','),
        },
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
          'If-Match': etag,
        },
      });

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
      await axios.delete(`${this.peopleApiUrl}/${resourceName}`, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

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
  async syncContacts(
    userId: string,
    direction: 'to_google' | 'from_google' | 'bidirectional' = 'bidirectional'
  ): Promise<SyncStats> {
    const stats: SyncStats = {
      added: 0,
      updated: 0,
      deleted: 0,
      skipped: 0,
      errors: 0,
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

      // 3. Create mappings for easier lookups
      const googleContactsMap = new Map<string, GoogleContact>();
      googleContacts.forEach((contact) => {
        // Use resourceName as key
        googleContactsMap.set(contact.resourceName, contact);
      });

      const salesblanketContactsMap = new Map<string, any>();
      const salesblanketByGoogleResourceMap = new Map<string, any>();

      salesblanketContacts.forEach((contact) => {
        // Use internal ID as key
        salesblanketContactsMap.set(contact.id, contact);

        // Also map by Google resource name if available
        if (contact.google_resource_name) {
          salesblanketByGoogleResourceMap.set(contact.google_resource_name, contact);
        }
      });

      // 4. Sync based on direction
      if (direction === 'to_google' || direction === 'bidirectional') {
        // Sync SalesBlanket contacts to Google
        for (const contact of salesblanketContacts) {
          try {
            if (!contact.google_resource_name) {
              // Contact doesn't exist in Google, create it
              const googleContactData = {
                firstName: contact.first_name,
                lastName: contact.last_name,
                email: contact.email,
                phone: contact.phone,
                salesblanketId: contact.id,
              };

              const createdContact = await this.createGoogleContact(userId, googleContactData);

              // Update SalesBlanket contact with Google resource name and etag
              await this.pool.query(
                `UPDATE contacts SET 
                google_resource_name = $1, 
                google_etag = $2, 
                last_synced_at = $3,
                updated_at = $3
               WHERE id = $4`,
                [createdContact.resourceName, createdContact.etag, new Date(), contact.id]
              );

              stats.added++;
            } else if (googleContactsMap.has(contact.google_resource_name)) {
              // Contact exists in Google, check if update needed
              const googleContact = googleContactsMap.get(contact.google_resource_name)!;
              const lastSyncedAt = contact.last_synced_at
                ? new Date(contact.last_synced_at)
                : new Date(0);
              const updatedAt = new Date(contact.updated_at);

              if (updatedAt > lastSyncedAt) {
                // SalesBlanket contact was updated after last sync, update Google
                const contactData: any = {
                  firstName: contact.first_name,
                  lastName: contact.last_name,
                };

                if (contact.email) contactData.email = contact.email;
                if (contact.phone) contactData.phone = contact.phone;

                const updatedContact = await this.updateGoogleContact(
                  userId,
                  contact.google_resource_name,
                  contactData,
                  googleContact.etag
                );

                // Update etag and last_synced_at
                await this.pool.query(
                  `UPDATE contacts SET 
                  google_etag = $1, 
                  last_synced_at = $2,
                  updated_at = $2
                 WHERE id = $3`,
                  [updatedContact.etag, new Date(), contact.id]
                );

                stats.updated++;
              } else {
                stats.skipped++;
              }
            } else {
              // Contact has a resource name but doesn't exist in Google anymore
              // This is a special case - handle based on your business logic
              // Here we'll just update the contact to remove the Google reference
              await this.pool.query(
                `UPDATE contacts SET 
                google_resource_name = NULL, 
                google_etag = NULL
               WHERE id = $1`,
                [contact.id]
              );

              stats.deleted++;
            }
          } catch (error) {
            console.error(`Error syncing contact ${contact.id} to Google:`, error);
            stats.errors++;
          }
        }
      }

      if (direction === 'from_google' || direction === 'bidirectional') {
        // Sync Google contacts to SalesBlanket
        for (const contact of googleContacts) {
          try {
            // Only sync contacts that have our source type
            const hasSalesBlanketSource = contact.metadata.sources.some(
              (source) => source.type === this.saleblankSourceType
            );

            if (!hasSalesBlanketSource) {
              // Skip contacts not from our system
              stats.skipped++;
              continue;
            }

            if (salesblanketByGoogleResourceMap.has(contact.resourceName)) {
              // Contact exists in SalesBlanket, update if needed
              const sbContact = salesblanketByGoogleResourceMap.get(contact.resourceName);

              // Get primary name, email, phone from Google contact
              const name = contact.names?.find((n) => n.metadata.primary)?.displayName || '';
              const email = contact.emailAddresses?.find((e) => e.metadata.primary)?.value || '';
              const phone = contact.phoneNumbers?.find((p) => p.metadata.primary)?.value || '';

              // Split name into first/last
              const nameParts = name.split(' ');
              const firstName = nameParts[0] || '';
              const lastName = nameParts.slice(1).join(' ') || '';

              // Check if update needed
              if (
                sbContact.first_name !== firstName ||
                sbContact.last_name !== lastName ||
                sbContact.email !== email ||
                sbContact.phone !== phone
              ) {
                // Update SalesBlanket contact
                await this.pool.query(
                  `UPDATE contacts SET 
                  first_name = $1, 
                  last_name = $2, 
                  email = $3,
                  phone = $4,
                  google_etag = $5,
                  last_synced_at = $6,
                  updated_at = $6
                 WHERE id = $7`,
                  [firstName, lastName, email, phone, contact.etag, new Date(), sbContact.id]
                );

                stats.updated++;
              } else {
                stats.skipped++;
              }
            } else {
              // Contact doesn't exist in SalesBlanket, create it
              // Extract source ID (our internal ID) if available
              const salesblanketSource = contact.metadata.sources.find(
                (source) => source.type === this.saleblankSourceType
              );

              const salesblanketId = salesblanketSource?.id;

              // Only create if we have a valid source ID and it's not in our local DB
              if (salesblanketId && !salesblanketContactsMap.has(salesblanketId)) {
                // Get primary name, email, phone from Google contact
                const name = contact.names?.find((n) => n.metadata.primary)?.displayName || '';
                const email = contact.emailAddresses?.find((e) => e.metadata.primary)?.value || '';
                const phone = contact.phoneNumbers?.find((p) => p.metadata.primary)?.value || '';

                // Split name into first/last
                const nameParts = name.split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                // Create new contact
                const id = salesblanketId || uuidv4();
                const now = new Date();

                await this.pool.query(
                  `INSERT INTO contacts (
                  id, first_name, last_name, email, phone,
                  contact_type_id, status, google_resource_name,
                  google_etag, last_synced_at, created_by,
                  created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12)`,
                  [
                    id,
                    firstName,
                    lastName,
                    email,
                    phone,
                    'DEFAULT',
                    'ACTIVE',
                    contact.resourceName,
                    contact.etag,
                    now,
                    userId,
                    now,
                  ]
                );

                stats.added++;
              } else {
                stats.skipped++;
              }
            }
          } catch (error) {
            console.error(
              `Error syncing Google contact ${contact.resourceName} to SalesBlanket:`,
              error
            );
            stats.errors++;
          }
        }
      }

      return stats;
    } catch (error) {
      console.error('Error syncing contacts:', error);
      throw error;
    }
  }
}
