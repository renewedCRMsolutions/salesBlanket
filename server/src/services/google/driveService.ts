// server/src/services/google/driveService.ts
import axios from 'axios';
import FormData from 'form-data';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { GoogleAuthService } from './googleAuthService';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  kind: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink?: string;
  thumbnailLink?: string;
  iconLink?: string;
  size?: string;
  parents?: string[];
  webContentLink?: string;
  labelInfo?: any;
}

export interface DriveFolder {
  id: string;
  name: string;
  mimeType: string;
  kind: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink?: string;
  parents?: string[];
}

export class GoogleDriveService {
  private pool: Pool;
  private authService: GoogleAuthService;
  private driveApiUrl: string = 'https://www.googleapis.com/drive/v3';
  private mainFolderId?: string;

  constructor(pool: Pool) {
    this.pool = pool;
    this.authService = new GoogleAuthService(pool);

    // Load main folder ID from environment
    this.mainFolderId = process.env.GOOGLE_DRIVE_MAIN_FOLDER_ID;

    if (!this.mainFolderId) {
      console.warn('Google Drive main folder ID not set. Files will be uploaded to Drive root.');
    }
  }

  /**
   * Create folder structure for SalesBlanket organization
   * @param userId - User ID to create folders under
   * @returns Object with folder IDs
   */
  async initializeFolderStructure(userId: string): Promise<{ [key: string]: string }> {
    // Get valid tokens
    const tokens = await this.authService.getValidTokensForUser(userId);

    if (!tokens) {
      throw new Error('User is not authenticated with Google');
    }

    // Create main folder if not already set
    if (!this.mainFolderId) {
      this.mainFolderId = await this.createFolder(tokens.access_token, 'SalesBlanket');

      // Save to environment for future use
      // In production, this would be saved to a configuration database
      process.env.GOOGLE_DRIVE_MAIN_FOLDER_ID = this.mainFolderId;
    }

    // Create entity type folders
    const folderIds: { [key: string]: string } = {
      main: this.mainFolderId,
    };

    folderIds.addresses = await this.createFolder(
      tokens.access_token,
      'Addresses',
      this.mainFolderId
    );
    folderIds.contacts = await this.createFolder(
      tokens.access_token,
      'Contacts',
      this.mainFolderId
    );
    folderIds.opportunities = await this.createFolder(
      tokens.access_token,
      'Opportunities',
      this.mainFolderId
    );
    folderIds.photos = await this.createFolder(tokens.access_token, 'Photos', this.mainFolderId);
    folderIds.documents = await this.createFolder(
      tokens.access_token,
      'Documents',
      this.mainFolderId
    );

    // Create subfolders for each entity type
    // Photos folder structure
    folderIds.addressPhotos = await this.createFolder(
      tokens.access_token,
      'Address Photos',
      folderIds.photos
    );
    folderIds.contactPhotos = await this.createFolder(
      tokens.access_token,
      'Contact Photos',
      folderIds.photos
    );
    folderIds.opportunityPhotos = await this.createFolder(
      tokens.access_token,
      'Opportunity Photos',
      folderIds.photos
    );

    // Document folder structure
    folderIds.addressDocuments = await this.createFolder(
      tokens.access_token,
      'Address Documents',
      folderIds.documents
    );
    folderIds.contactDocuments = await this.createFolder(
      tokens.access_token,
      'Contact Documents',
      folderIds.documents
    );
    folderIds.opportunityDocuments = await this.createFolder(
      tokens.access_token,
      'Opportunity Documents',
      folderIds.documents
    );

    return folderIds;
  }

  /**
   * Create a folder in Google Drive
   * @param accessToken - Google access token
   * @param name - Folder name
   * @param parentId - Optional parent folder ID
   * @returns Folder ID
   */
  async createFolder(accessToken: string, name: string, parentId?: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.driveApiUrl}/files`,
        {
          name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: parentId ? [parentId] : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.id;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw new Error('Failed to create folder in Google Drive');
    }
  }

  /**
   * Upload a file to Google Drive
   * @param userId - User ID uploading the file
   * @param file - File buffer/stream
   * @param fileName - File name
   * @param mimeType - File MIME type
   * @param parentId - Optional parent folder ID
   * @param metadata - Optional additional metadata
   * @returns Uploaded file
   */
  async uploadFile(
    userId: string,
    file: Buffer,
    fileName: string,
    mimeType: string,
    parentId?: string,
    metadata?: any
  ): Promise<DriveFile> {
    // Get valid tokens
    const tokens = await this.authService.getValidTokensForUser(userId);

    if (!tokens) {
      throw new Error('User is not authenticated with Google');
    }

    try {
      // Create metadata part
      const metadataObj: any = {
        name: fileName,
        parents: parentId ? [parentId] : undefined,
      };

      // Add custom metadata if provided
      if (metadata) {
        metadataObj.appProperties = metadata;
      }

      const metadataJson = JSON.stringify(metadataObj);

      // Create form data
      const formData = new FormData();

      // Add metadata part
      formData.append('metadata', metadataJson, {
        contentType: 'application/json',
      });

      // Add file part
      formData.append('file', file, {
        filename: fileName,
        contentType: mimeType,
      });

      // Upload file
      const response = await axios.post(
        `${this.driveApiUrl}/files?uploadType=multipart`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            ...formData.getHeaders(),
          },
        }
      );

      // Get file details
      return this.getFile(userId, response.data.id);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file to Google Drive');
    }
  }

  /**
   * Get file details
   * @param userId - User ID
   * @param fileId - Google Drive file ID
   * @returns File details
   */
  async getFile(userId: string, fileId: string): Promise<DriveFile> {
    // Get valid tokens
    const tokens = await this.authService.getValidTokensForUser(userId);

    if (!tokens) {
      throw new Error('User is not authenticated with Google');
    }

    try {
      const response = await axios.get(`${this.driveApiUrl}/files/${fileId}`, {
        params: {
          fields:
            'id,name,mimeType,kind,createdTime,modifiedTime,webViewLink,thumbnailLink,iconLink,size,parents,webContentLink,labelInfo',
        },
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error getting file:', error);
      throw new Error('Failed to get file from Google Drive');
    }
  }

  /**
   * List files in a folder
   * @param userId - User ID
   * @param folderId - Google Drive folder ID
   * @returns Array of files
   */
  async listFiles(userId: string, folderId?: string): Promise<DriveFile[]> {
    // Get valid tokens
    const tokens = await this.authService.getValidTokensForUser(userId);

    if (!tokens) {
      throw new Error('User is not authenticated with Google');
    }

    try {
      const query = folderId ? `'${folderId}' in parents` : '';

      const response = await axios.get(`${this.driveApiUrl}/files`, {
        params: {
          q: query,
          fields:
            'files(id,name,mimeType,kind,createdTime,modifiedTime,webViewLink,thumbnailLink,iconLink,size,parents,webContentLink,labelInfo)',
        },
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      return response.data.files;
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error('Failed to list files from Google Drive');
    }
  }

  /**
   * Apply labels to a file
   * @param userId - User ID
   * @param fileId - Google Drive file ID
   * @param labels - Labels to apply
   * @returns Updated file
   */
  async applyLabels(userId: string, fileId: string, labels: any): Promise<DriveFile> {
    // Google Drive Labels API requires additional scopes and is complex
    // This is a placeholder for a real implementation
    // In production, you would use the Drive Labels API to apply labels

    // Get valid tokens
    const tokens = await this.authService.getValidTokensForUser(userId);

    if (!tokens) {
      throw new Error('User is not authenticated with Google');
    }

    try {
      // For now, we'll just update appProperties which is simpler
      const response = await axios.patch(
        `${this.driveApiUrl}/files/${fileId}`,
        {
          appProperties: labels,
        },
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return this.getFile(userId, fileId);
    } catch (error) {
      console.error('Error applying labels:', error);
      throw new Error('Failed to apply labels to file in Google Drive');
    }
  }

  /**
   * Generate a public shareable link for a file
   * @param userId - User ID
   * @param fileId - Google Drive file ID
   * @returns Shareable link
   */
  async createSharableLink(userId: string, fileId: string): Promise<string> {
    // Get valid tokens
    const tokens = await this.authService.getValidTokensForUser(userId);

    if (!tokens) {
      throw new Error('User is not authenticated with Google');
    }

    try {
      // Create permission for anyone to view the file
      await axios.post(
        `${this.driveApiUrl}/files/${fileId}/permissions`,
        {
          role: 'reader',
          type: 'anyone',
        },
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Get file to get web view link
      const file = await this.getFile(userId, fileId);

      return file.webViewLink || '';
    } catch (error) {
      console.error('Error creating shareable link:', error);
      throw new Error('Failed to create shareable link for file in Google Drive');
    }
  }

  /**
   * Delete a file/folder from Google Drive
   * @param userId - User ID
   * @param fileId - Google Drive file ID
   * @returns Boolean indicating success
   */
  async deleteFile(userId: string, fileId: string): Promise<boolean> {
    // Get valid tokens
    const tokens = await this.authService.getValidTokensForUser(userId);

    if (!tokens) {
      throw new Error('User is not authenticated with Google');
    }

    try {
      await axios.delete(`${this.driveApiUrl}/files/${fileId}`, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file from Google Drive');
    }
  }

  /**
   * Store file metadata in database
   * @param userId - User ID
   * @param entityId - Entity ID to associate file with
   * @param entityType - Entity type (address, contact, opportunity)
   * @param file - Google Drive file
   * @param fileType - File type (photo, document, etc.)
   * @returns Database record ID
   */
  async storeFileMetadata(
    userId: string,
    entityId: string,
    entityType: string,
    file: DriveFile,
    fileType: string
  ): Promise<string> {
    const id = uuidv4();
    const now = new Date();

    const query = `
      INSERT INTO entity_files (
        id, entity_id, entity_type, file_type, name, 
        drive_file_id, drive_view_link, drive_download_link,
        thumbnail_url, mime_type, size, created_by,
        metadata, created_at, updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $14
      )
      RETURNING id
    `;

    const values = [
      id,
      entityId,
      entityType,
      fileType,
      file.name,
      file.id,
      file.webViewLink || null,
      file.webContentLink || null,
      file.thumbnailLink || null,
      file.mimeType,
      file.size ? parseInt(file.size) : null,
      userId,
      JSON.stringify(file),
      now,
    ];

    try {
      const result = await this.pool.query(query, values);
      return result.rows[0].id;
    } catch (error) {
      console.error('Error storing file metadata:', error);
      throw error;
    }
  }

  /**
   * Get files for an entity
   * @param entityId - Entity ID
   * @param entityType - Entity type
   * @param fileType - Optional file type filter
   * @returns Array of files
   */
  async getFilesForEntity(entityId: string, entityType: string, fileType?: string): Promise<any[]> {
    let query = `
      SELECT * FROM entity_files
      WHERE entity_id = $1 AND entity_type = $2
    `;

    const values = [entityId, entityType];

    if (fileType) {
      query += ` AND file_type = $3`;
      values.push(fileType);
    }

    query += ` ORDER BY created_at DESC`;

    try {
      const result = await this.pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error getting files for entity:', error);
      throw error;
    }
  }
}
