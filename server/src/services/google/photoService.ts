// server/src/services/photoService.ts
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { GoogleDriveService } from './google/driveService';

export interface PulsePhoto {
  id: string;
  entityId: string;
  entityType: string;
  name: string;
  fileType: string;
  driveFileId: string;
  driveViewLink?: string;
  driveDownloadLink?: string;
  thumbnailUrl?: string;
  mimeType?: string;
  size?: number;
  createdBy: string;
  isPrimary: boolean;
  photoType?: string;
  captureDate?: Date;
  labels?: any;
  annotations?: any;
  visibilityLevel: string;
  isExternalVisible: boolean;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhotoFilter {
  entityId?: string;
  entityType?: string;
  fileType?: string;
  photoType?: string;
  createdBy?: string;
  isPrimary?: boolean;
  limit?: number;
  offset?: number;
}

export interface PhotoAnnotation {
  id: string;
  photoId: string;
  annotationType: string;
  coordinates: any;
  properties?: any;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PhotoService {
  private pool: Pool;
  private driveService: GoogleDriveService;

  constructor(pool: Pool) {
    this.pool = pool;
    this.driveService = new GoogleDriveService(pool);
  }

  /**
   * Upload a photo for an entity
   * @param userId - User ID
   * @param entityId - Entity ID
   * @param entityType - Entity type (address, contact, opportunity)
   * @param file - File buffer
   * @param fileName - File name
   * @param mimeType - File MIME type
   * @param options - Additional options
   * @returns Uploaded photo
   */
  async uploadPhoto(
    userId: string,
    entityId: string,
    entityType: string,
    file: Buffer,
    fileName: string,
    mimeType: string,
    options: {
      fileType?: string;
      photoType?: string;
      isPrimary?: boolean;
      captureDate?: Date;
      visibilityLevel?: string;
      isExternalVisible?: boolean;
      metadata?: any;
    } = {}
  ): Promise<PulsePhoto> {
    try {
      // 1. First upload to Google Drive
      // Determine appropriate folder based on entity type
      let folderId: string;

      // Temporarily get all folders - in production you'd have this cached or stored
      const folders = await this.driveService.initializeFolderStructure(userId);

      switch (entityType.toUpperCase()) {
        case 'CONTACT':
          folderId = folders.contactPhotos;
          break;
        case 'ADDRESS':
          folderId = folders.addressPhotos;
          break;
        case 'OPPORTUNITY':
          folderId = folders.opportunityPhotos;
          break;
        default:
          folderId = folders.photos;
      }

      // Add entity metadata for Google Drive
      const metadata = {
        entityId,
        entityType,
        photoType: options.photoType || 'GENERAL',
        ...options.metadata,
      };

      // Upload to Drive
      const driveFile = await this.driveService.uploadFile(
        userId,
        file,
        fileName,
        mimeType,
        folderId,
        metadata
      );

      // 2. Create record in our database
      const id = uuidv4();
      const now = new Date();

      const query = `
        INSERT INTO entity_card_pulse_photos (
          id, entity_id, entity_type, name, file_type,
          drive_file_id, drive_view_link, drive_download_link,
          thumbnail_url, mime_type, size, created_by,
          is_primary, photo_type, capture_date, labels,
          annotations, visibility_level, is_external_visible,
          metadata, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
          $13, $14, $15, $16, $17, $18, $19, $20, $21, $21
        ) RETURNING *
      `;

      const values = [
        id,
        entityId,
        entityType.toUpperCase(),
        fileName,
        options.fileType || 'IMAGE',
        driveFile.id,
        driveFile.webViewLink || null,
        driveFile.webContentLink || null,
        driveFile.thumbnailLink || null,
        driveFile.mimeType,
        driveFile.size ? parseInt(driveFile.size) : null,
        userId,
        options.isPrimary || false,
        options.photoType || 'GENERAL',
        options.captureDate || null,
        driveFile.labelInfo ? JSON.stringify(driveFile.labelInfo) : null,
        null, // No annotations yet
        options.visibilityLevel || 'ALL',
        options.isExternalVisible || false,
        options.metadata ? JSON.stringify(options.metadata) : null,
        now,
      ];

      const result = await this.pool.query(query, values);

      // 3. If marked as primary, ensure it's the only primary
      if (options.isPrimary) {
        await this.resetOtherPrimaryPhotos(id, entityId, entityType);
      }

      return this.mapPhotoFromDatabase(result.rows[0]);
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  }

  /**
   * Reset other photos to non-primary
   * @param currentPhotoId - Current photo ID (to exclude)
   * @param entityId - Entity ID
   * @param entityType - Entity type
   */
  private async resetOtherPrimaryPhotos(
    currentPhotoId: string,
    entityId: string,
    entityType: string
  ): Promise<void> {
    const query = `
      UPDATE entity_card_pulse_photos
      SET is_primary = FALSE
      WHERE id != $1 AND entity_id = $2 AND entity_type = $3 AND is_primary = TRUE
    `;

    try {
      await this.pool.query(query, [currentPhotoId, entityId, entityType.toUpperCase()]);
    } catch (error) {
      console.error('Error resetting primary photos:', error);
      // Non-critical error, don't throw
    }
  }

  /**
   * Get photos by filter
   * @param filter - Photo filter
   * @param userRole - User role for visibility filtering
   * @param isExternal - Whether the user is external
   * @returns Array of photos
   */
  async getPhotos(
    filter: PhotoFilter,
    userRole: string,
    isExternal: boolean = false
  ): Promise<PulsePhoto[]> {
    let query = `
      SELECT p.* FROM entity_card_pulse_photos p
      JOIN entity_card_pulse_role_levels rl1 ON p.visibility_level = rl1.role
      JOIN entity_card_pulse_role_levels rl2 ON $1 = rl2.role
      WHERE rl2.access_level >= rl1.access_level
    `;

    const values: any[] = [userRole];
    let paramIndex = 2;

    // Add filters
    if (filter.entityId) {
      query += ` AND p.entity_id = $${paramIndex++}`;
      values.push(filter.entityId);
    }

    if (filter.entityType) {
      query += ` AND p.entity_type = $${paramIndex++}`;
      values.push(filter.entityType.toUpperCase());
    }

    if (filter.fileType) {
      query += ` AND p.file_type = $${paramIndex++}`;
      values.push(filter.fileType);
    }

    if (filter.photoType) {
      query += ` AND p.photo_type = $${paramIndex++}`;
      values.push(filter.photoType);
    }

    if (filter.createdBy) {
      query += ` AND p.created_by = $${paramIndex++}`;
      values.push(filter.createdBy);
    }

    if (filter.isPrimary !== undefined) {
      query += ` AND p.is_primary = $${paramIndex++}`;
      values.push(filter.isPrimary);
    }

    // External users can only see photos marked as external visible
    if (isExternal) {
      query += ` AND p.is_external_visible = TRUE`;
    }

    // Order by primary first, then creation date (newest first)
    query += ` ORDER BY p.is_primary DESC, p.created_at DESC`;

    // Add limit and offset if provided
    if (filter.limit) {
      query += ` LIMIT $${paramIndex++}`;
      values.push(filter.limit);
    }

    if (filter.offset) {
      query += ` OFFSET $${paramIndex++}`;
      values.push(filter.offset);
    }

    try {
      const result = await this.pool.query(query, values);
      return result.rows.map(this.mapPhotoFromDatabase);
    } catch (error) {
      console.error('Error getting photos:', error);
      throw error;
    }
  }

  /**
   * Add annotation to a photo
   * @param photoId - Photo ID
   * @param userId - User ID
   * @param annotationType - Annotation type
   * @param coordinates - Coordinates (vector data)
   * @param properties - Additional properties
   * @returns Created annotation
   */
  async addAnnotation(
    photoId: string,
    userId: string,
    annotationType: string,
    coordinates: any,
    properties?: any
  ): Promise<PhotoAnnotation> {
    const id = uuidv4();
    const now = new Date();

    const query = `
      INSERT INTO entity_card_pulse_photo_annotations (
        id, photo_id, annotation_type, coordinates,
        properties, created_by, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $7
      ) RETURNING *
    `;

    const values = [
      id,
      photoId,
      annotationType,
      JSON.stringify(coordinates),
      properties ? JSON.stringify(properties) : null,
      userId,
      now,
    ];

    try {
      const result = await this.pool.query(query, values);

      // Update the annotations JSON in the main photo record
      await this.updatePhotoAnnotations(photoId);

      return this.mapAnnotationFromDatabase(result.rows[0]);
    } catch (error) {
      console.error('Error adding annotation:', error);
      throw error;
    }
  }

  /**
   * Update annotations JSON in photo record
   * @param photoId - Photo ID
   */
  private async updatePhotoAnnotations(photoId: string): Promise<void> {
    // Get all annotations for this photo
    const annotationsQuery = `
      SELECT * FROM entity_card_pulse_photo_annotations
      WHERE photo_id = $1
      ORDER BY created_at
    `;

    try {
      const annotations = await this.pool.query(annotationsQuery, [photoId]);

      // Update the photo record with all annotations as JSON
      const updateQuery = `
        UPDATE entity_card_pulse_photos
        SET annotations = $1, updated_at = $2
        WHERE id = $3
      `;

      await this.pool.query(updateQuery, [JSON.stringify(annotations.rows), new Date(), photoId]);
    } catch (error) {
      console.error('Error updating photo annotations:', error);
      // Non-critical error, don't throw
    }
  }

  /**
   * Delete a photo
   * @param photoId - Photo ID
   * @param userId - User ID
   * @returns Boolean indicating success
   */
  async deletePhoto(photoId: string, userId: string): Promise<boolean> {
    try {
      // First get the photo to get the Drive file ID
      const photo = await this.getPhotoById(photoId);

      if (!photo) {
        return false;
      }

      // Delete from Google Drive
      await this.driveService.deleteFile(userId, photo.driveFileId);

      // Delete from our database
      const query = `
        DELETE FROM entity_card_pulse_photos
        WHERE id = $1
        RETURNING id
      `;

      const result = await this.pool.query(query, [photoId]);

      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting photo:', error);
      return false;
    }
  }

  /**
   * Get a photo by ID
   * @param photoId - Photo ID
   * @returns Photo or null if not found
   */
  async getPhotoById(photoId: string): Promise<PulsePhoto | null> {
    const query = `
      SELECT * FROM entity_card_pulse_photos
      WHERE id = $1
    `;

    try {
      const result = await this.pool.query(query, [photoId]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapPhotoFromDatabase(result.rows[0]);
    } catch (error) {
      console.error('Error getting photo by ID:', error);
      throw error;
    }
  }

  /**
   * Map database photo to PulsePhoto interface
   * @param dbPhoto - Database photo record
   * @returns PulsePhoto object
   */
  private mapPhotoFromDatabase(dbPhoto: any): PulsePhoto {
    return {
      id: dbPhoto.id,
      entityId: dbPhoto.entity_id,
      entityType: dbPhoto.entity_type,
      name: dbPhoto.name,
      fileType: dbPhoto.file_type,
      driveFileId: dbPhoto.drive_file_id,
      driveViewLink: dbPhoto.drive_view_link,
      driveDownloadLink: dbPhoto.drive_download_link,
      thumbnailUrl: dbPhoto.thumbnail_url,
      mimeType: dbPhoto.mime_type,
      size: dbPhoto.size,
      createdBy: dbPhoto.created_by,
      isPrimary: dbPhoto.is_primary,
      photoType: dbPhoto.photo_type,
      captureDate: dbPhoto.capture_date,
      labels: dbPhoto.labels,
      annotations: dbPhoto.annotations,
      visibilityLevel: dbPhoto.visibility_level,
      isExternalVisible: dbPhoto.is_external_visible,
      metadata: dbPhoto.metadata,
      createdAt: dbPhoto.created_at,
      updatedAt: dbPhoto.updated_at,
    };
  }

  /**
   * Map database annotation to PhotoAnnotation interface
   * @param dbAnnotation - Database annotation record
   * @returns PhotoAnnotation object
   */
  private mapAnnotationFromDatabase(dbAnnotation: any): PhotoAnnotation {
    return {
      id: dbAnnotation.id,
      photoId: dbAnnotation.photo_id,
      annotationType: dbAnnotation.annotation_type,
      coordinates: dbAnnotation.coordinates,
      properties: dbAnnotation.properties,
      createdBy: dbAnnotation.created_by,
      createdAt: dbAnnotation.created_at,
      updatedAt: dbAnnotation.updated_at,
    };
  }
}
