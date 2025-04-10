// server/src/services/google/googleAuthService.ts
import { Pool } from 'pg';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Define types for Google tokens and user info
export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expiry_date: number;
  token_type: string;
  scope: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export class GoogleAuthService {
  private pool: Pool;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(pool: Pool) {
    this.pool = pool;
    // Load from environment variables
    this.clientId = process.env.GOOGLE_CLIENT_ID || '';
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    this.redirectUri = process.env.GOOGLE_REDIRECT_URI || '';

    if (!this.clientId || !this.clientSecret) {
      console.warn('Google OAuth credentials not set. Google authentication will not work.');
    }
  }

  /**
   * Generate OAuth URL for Google authentication
   * @param scopes - Array of OAuth scopes to request
   * @param userId - Optional user ID to associate with the auth flow
   * @returns Authorization URL to redirect user to
   */
  generateAuthUrl(scopes: string[], userId?: string): string {
    // Default scopes if none provided
    const defaultScopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    const finalScopes = scopes.length > 0 ? scopes : defaultScopes;

    // Create state parameter to track user in callback
    const state = userId ? Buffer.from(JSON.stringify({ userId })).toString('base64') : '';

    // Build authorization URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', this.clientId);
    authUrl.searchParams.append('redirect_uri', this.redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', finalScopes.join(' '));
    authUrl.searchParams.append('access_type', 'offline');
    authUrl.searchParams.append('prompt', 'consent');

    if (state) {
      authUrl.searchParams.append('state', state);
    }

    return authUrl.toString();
  }

  /**
   * Exchange authorization code for tokens
   * @param code - Authorization code from OAuth redirect
   * @returns Google tokens
   */
  async getTokensFromCode(code: string): Promise<GoogleTokens> {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
      });

      // Calculate expiry date
      const expiryDate = Date.now() + response.data.expires_in * 1000;

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        id_token: response.data.id_token,
        expiry_date: expiryDate,
        token_type: response.data.token_type,
        scope: response.data.scope,
      };
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  /**
   * Get Google user information using an access token
   * @param accessToken - Google access token
   * @returns User profile information
   */
  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error getting Google user info:', error);
      throw new Error('Failed to get Google user information');
    }
  }

  /**
   * Refresh an expired access token
   * @param refreshToken - Google refresh token
   * @returns New tokens
   */
  async refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
      });

      // Calculate expiry date
      const expiryDate = Date.now() + response.data.expires_in * 1000;

      return {
        access_token: response.data.access_token,
        refresh_token: refreshToken, // Use existing refresh token
        id_token: response.data.id_token,
        expiry_date: expiryDate,
        token_type: response.data.token_type,
        scope: response.data.scope,
      };
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh Google access token');
    }
  }

  /**
   * Store Google tokens in database
   * @param userId - User ID to associate tokens with
   * @param tokens - Google tokens to store
   * @param scopes - OAuth scopes granted
   * @returns Token record ID
   */
  async storeTokens(userId: string, tokens: GoogleTokens, scopes: string[]): Promise<string> {
    const id = uuidv4();
    const now = new Date();

    // Check if user already has tokens
    const existingQuery = `
      SELECT id FROM user_google_tokens 
      WHERE user_id = $1 
      LIMIT 1
    `;

    const existingResult = await this.pool.query(existingQuery, [userId]);
    const existingId = existingResult.rows.length > 0 ? existingResult.rows[0].id : null;

    if (existingId) {
      // Update existing tokens
      const updateQuery = `
        UPDATE user_google_tokens
        SET 
          access_token = $1, 
          refresh_token = COALESCE($2, refresh_token),
          id_token = $3,
          expiry_date = $4,
          scopes = $5,
          updated_at = $6
        WHERE id = $7
        RETURNING id
      `;

      const updateValues = [
        tokens.access_token,
        tokens.refresh_token || null,
        tokens.id_token || null,
        new Date(tokens.expiry_date),
        scopes,
        now,
        existingId,
      ];

      const result = await this.pool.query(updateQuery, updateValues);
      return result.rows[0].id;
    } else {
      // Insert new tokens
      const insertQuery = `
        INSERT INTO user_google_tokens (
          id, user_id, access_token, refresh_token, id_token,
          expiry_date, scopes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
        RETURNING id
      `;

      const insertValues = [
        id,
        userId,
        tokens.access_token,
        tokens.refresh_token || null,
        tokens.id_token || null,
        new Date(tokens.expiry_date),
        scopes,
        now,
      ];

      const result = await this.pool.query(insertQuery, insertValues);
      return result.rows[0].id;
    }
  }

  /**
   * Get tokens for a user
   * @param userId - User ID to get tokens for
   * @returns Google tokens or null if not found
   */
  async getTokensForUser(userId: string): Promise<GoogleTokens | null> {
    try {
      const query = `
        SELECT 
          access_token, refresh_token, id_token, 
          expiry_date, scopes
        FROM user_google_tokens
        WHERE user_id = $1
        LIMIT 1
      `;

      const result = await this.pool.query(query, [userId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];

      return {
        access_token: row.access_token,
        refresh_token: row.refresh_token,
        id_token: row.id_token,
        expiry_date: new Date(row.expiry_date).getTime(),
        token_type: 'Bearer',
        scope: Array.isArray(row.scopes) ? row.scopes.join(' ') : row.scopes,
      };
    } catch (error) {
      console.error('Error getting tokens for user:', error);
      throw error;
    }
  }

  /**
   * Get valid tokens for a user (refresh if needed)
   * @param userId - User ID to get tokens for
   * @returns Valid Google tokens or null if not found
   */
  async getValidTokensForUser(userId: string): Promise<GoogleTokens | null> {
    try {
      // Get existing tokens
      const tokens = await this.getTokensForUser(userId);

      if (!tokens) {
        return null;
      }

      // Check if token is expired
      const isExpired = tokens.expiry_date <= Date.now();

      if (!isExpired) {
        return tokens;
      }

      // Refresh token if available
      if (!tokens.refresh_token) {
        throw new Error('Refresh token not available');
      }

      // Get new tokens
      const newTokens = await this.refreshAccessToken(tokens.refresh_token);

      // Store updated tokens
      const scopes = newTokens.scope.split(' ');
      await this.storeTokens(userId, newTokens, scopes);

      return newTokens;
    } catch (error) {
      console.error('Error getting valid tokens for user:', error);
      return null;
    }
  }

  /**
   * Revoke Google access
   * @param userId - User ID to revoke access for
   * @returns Boolean indicating success
   */
  async revokeAccess(userId: string): Promise<boolean> {
    try {
      // Get tokens
      const tokens = await this.getTokensForUser(userId);

      if (!tokens) {
        return false;
      }

      // Revoke access token with Google
      await axios.get(`https://accounts.google.com/o/oauth2/revoke?token=${tokens.access_token}`);

      // Delete tokens from database
      const query = `
        DELETE FROM user_google_tokens
        WHERE user_id = $1
      `;

      await this.pool.query(query, [userId]);

      return true;
    } catch (error) {
      console.error('Error revoking Google access:', error);
      return false;
    }
  }
}
