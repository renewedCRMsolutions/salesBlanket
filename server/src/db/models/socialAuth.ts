import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export interface SocialProfile {
  provider: string;
  providerId: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  profileUrl?: string;
  photoUrl?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: Date;
}

export class SocialAuth {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Find a user by social provider ID
   * 
   * @param provider Social provider (google, facebook, amazon)
   * @param providerId Provider-specific user ID
   * @returns User ID if found, null otherwise
   */
  async findUserBySocialId(provider: string, providerId: string): Promise<string | null> {
    const query = `
      SELECT user_id FROM user_social_profiles
      WHERE provider = $1 AND provider_id = $2
      LIMIT 1
    `;

    try {
      const result = await this.pool.query(query, [provider, providerId]);
      return result.rows.length > 0 ? result.rows[0].user_id : null;
    } catch (error) {
      console.error('Error finding user by social ID:', error);
      throw error;
    }
  }

  /**
   * Link a social profile to an existing user
   * 
   * @param userId User ID to link profile to
   * @param profile Social profile data
   * @returns The created social profile ID
   */
  async linkSocialProfile(userId: string, profile: SocialProfile): Promise<string> {
    const id = uuidv4();
    const now = new Date();

    const query = `
      INSERT INTO user_social_profiles (
        id, user_id, provider, provider_id, email, name,
        profile_url, photo_url, access_token, refresh_token, token_expiry,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12)
      ON CONFLICT (user_id, provider) DO UPDATE SET
        provider_id = $4,
        email = $5,
        name = $6,
        profile_url = $7,
        photo_url = $8,
        access_token = $9,
        refresh_token = $10,
        token_expiry = $11,
        updated_at = $12
      RETURNING id
    `;

    const values = [
      id, 
      userId, 
      profile.provider,
      profile.providerId,
      profile.email,
      profile.name,
      profile.profileUrl || null,
      profile.photoUrl || null,
      profile.accessToken,
      profile.refreshToken || null,
      profile.tokenExpiry || null,
      now
    ];

    try {
      const result = await this.pool.query(query, values);
      return result.rows[0].id;
    } catch (error) {
      console.error('Error linking social profile:', error);
      throw error;
    }
  }

  /**
   * Unlink a social profile from a user
   * 
   * @param userId User ID to unlink profile from
   * @param provider Social provider to unlink
   * @returns Boolean indicating success
   */
  async unlinkSocialProfile(userId: string, provider: string): Promise<boolean> {
    const query = `
      DELETE FROM user_social_profiles
      WHERE user_id = $1 AND provider = $2
    `;

    try {
      const result = await this.pool.query(query, [userId, provider]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error unlinking social profile:', error);
      throw error;
    }
  }

  /**
   * Verify a social token with the provider and get user information
   * 
   * @param provider Social provider (google, facebook, amazon)
   * @param token Access token to verify
   * @returns Social profile data if verification successful
   */
  async verifySocialToken(provider: string, token: string): Promise<SocialProfile | null> {
    try {
      switch (provider.toLowerCase()) {
        case 'google':
          return await this.verifyGoogleToken(token);
        case 'facebook':
          return await this.verifyFacebookToken(token);
        case 'amazon':
          return await this.verifyAmazonToken(token);
        default:
          throw new Error(`Unsupported social provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error verifying ${provider} token:`, error);
      return null;
    }
  }

  /**
   * Verify a Google OAuth token
   * 
   * @param token Google OAuth token
   * @returns Social profile data
   */
  private async verifyGoogleToken(token: string): Promise<SocialProfile> {
    const response = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    const data = response.data;
    
    return {
      provider: 'google',
      providerId: data.sub,
      email: data.email,
      name: data.name,
      firstName: data.given_name,
      lastName: data.family_name,
      photoUrl: data.picture,
      accessToken: token
    };
  }

  /**
   * Verify a Facebook OAuth token
   * 
   * @param token Facebook OAuth token
   * @returns Social profile data
   */
  private async verifyFacebookToken(token: string): Promise<SocialProfile> {
    const response = await axios.get(
      'https://graph.facebook.com/me',
      { 
        params: { 
          fields: 'id,email,name,first_name,last_name,picture',
          access_token: token 
        } 
      }
    );
    
    const data = response.data;
    
    return {
      provider: 'facebook',
      providerId: data.id,
      email: data.email,
      name: data.name,
      firstName: data.first_name,
      lastName: data.last_name,
      photoUrl: data.picture?.data?.url,
      accessToken: token
    };
  }

  /**
   * Verify an Amazon OAuth token
   * 
   * @param token Amazon OAuth token
   * @returns Social profile data
   */
  private async verifyAmazonToken(token: string): Promise<SocialProfile> {
    const response = await axios.get(
      'https://api.amazon.com/user/profile',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    const data = response.data;
    
    return {
      provider: 'amazon',
      providerId: data.user_id,
      email: data.email,
      name: data.name,
      accessToken: token
    };
  }
}