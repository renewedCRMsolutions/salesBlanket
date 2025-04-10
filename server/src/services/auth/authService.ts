import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { SocialAuth, SocialProfile } from '../../db/models/socialAuth';
import { UserAnalytics } from '../../db/models/userAnalytics';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  passwordHash?: string;
  status: string;
  avatarUrl?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginInput {
  username?: string;
  email?: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SocialLoginInput {
  provider: string;
  token: string;
}

export interface AuthResult {
  token: string;
  user: User;
  isNewUser?: boolean;
}

export class AuthService {
  private pool: Pool;
  private socialAuth: SocialAuth;
  private analytics: UserAnalytics;
  private jwtSecret: string;
  private jwtExpiration: string;

  constructor(pool: Pool) {
    this.pool = pool;
    this.socialAuth = new SocialAuth(pool);
    this.analytics = new UserAnalytics(pool);
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
    this.jwtExpiration = process.env.JWT_EXPIRES_IN || '1d';
  }

  /**
   * Register a new user
   *
   * @param input Registration data
   * @returns JWT token and user object
   */
  async register(input: RegisterInput, ipAddress?: string): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = await this.findUserByEmailOrUsername(input.email, input.username);
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(input.password, saltRounds);

    // Create user
    const id = uuidv4();
    const now = new Date();

    const query = `
      INSERT INTO users (
        id, username, email, password_hash, first_name, last_name,
        status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
      RETURNING id, username, email, first_name, last_name, status, created_at, updated_at
    `;

    const values = [
      id,
      input.username,
      input.email,
      passwordHash,
      input.firstName || null,
      input.lastName || null,
      'ACTIVE',
      now,
    ];

    try {
      const result = await this.pool.query(query, values);
      const user = this.mapUserFromDatabase(result.rows[0]);

      // Track registration event
      await this.analytics.trackEvent({
        userId: user.id,
        action: 'user.register',
        ipAddress,
        meta: {
          method: 'email',
        },
      });

      // Generate JWT token
      const token = this.generateToken(user);

      return { token, user };
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Login a user with email/username and password
   *
   * @param input Login credentials
   * @returns JWT token and user object
   */
  async login(input: LoginInput, ipAddress?: string): Promise<AuthResult> {
    // Find user by email or username
    const user = await this.findUserByEmailOrUsername(input.email || '', input.username || '');

    if (!user || !user.passwordHash) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await this.updateLastLogin(user.id);

    // Track login event
    await this.analytics.trackEvent({
      userId: user.id,
      action: 'user.login',
      ipAddress,
      meta: {
        method: 'password',
      },
    });

    // Generate JWT token
    const token = this.generateToken(user);

    return { token, user };
  }

  /**
   * Login or register a user with a social provider
   *
   * @param input Social login credentials
   * @returns JWT token, user object, and isNewUser flag
   */
  async socialLogin(input: SocialLoginInput, ipAddress?: string): Promise<AuthResult> {
    // Verify token with provider
    const profile = await this.socialAuth.verifySocialToken(input.provider, input.token);
    if (!profile) {
      throw new Error('Invalid social token');
    }

    // Find user by social provider ID
    let userId = await this.socialAuth.findUserBySocialId(profile.provider, profile.providerId);
    let isNewUser = false;

    // If user not found by social ID, try to find by email
    if (!userId && profile.email) {
      const user = await this.findUserByEmailOrUsername(profile.email, '');
      if (user) {
        userId = user.id;
      }
    }

    // If user still not found, register a new user
    if (!userId) {
      userId = await this.registerSocialUser(profile);
      isNewUser = true;
    }

    // Link social profile to user
    await this.socialAuth.linkSocialProfile(userId, profile);

    // Get complete user data
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found after social login');
    }

    // Update last login
    await this.updateLastLogin(user.id);

    // Track login event
    await this.analytics.trackEvent({
      userId: user.id,
      action: isNewUser ? 'user.register' : 'user.login',
      ipAddress,
      meta: {
        method: profile.provider,
      },
    });

    // Generate JWT token
    const token = this.generateToken(user);

    return { token, user, isNewUser };
  }

  /**
   * Register a new user from social profile
   *
   * @param profile Social profile data
   * @returns New user ID
   */
  private async registerSocialUser(profile: SocialProfile): Promise<string> {
    const id = uuidv4();
    const now = new Date();

    // Generate a unique username from email
    let username = profile.email.split('@')[0];
    const existingUser = await this.findUserByEmailOrUsername('', username);
    if (existingUser) {
      username = `${username}${Math.floor(Math.random() * 10000)}`;
    }

    const query = `
      INSERT INTO users (
        id, username, email, first_name, last_name,
        avatar_url, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
      RETURNING id
    `;

    const values = [
      id,
      username,
      profile.email,
      profile.firstName || profile.name?.split(' ')[0] || null,
      profile.lastName || profile.name?.split(' ').slice(1).join(' ') || null,
      profile.photoUrl || null,
      'ACTIVE',
      now,
    ];

    try {
      const result = await this.pool.query(query, values);
      return result.rows[0].id;
    } catch (error) {
      console.error('Error registering user from social profile:', error);
      throw error;
    }
  }

  /**
   * Generate a JWT token for a user
   *
   * @param user User object
   * @returns JWT token string
   */
  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };

    // @ts-ignore
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiration,
    });
  }

  /**
   * Verify a JWT token
   *
   * @param token JWT token
   * @returns Decoded token payload or null
   */
  verifyToken(token: string): any {
    try {
      // @ts-ignore
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      return null;
    }
  }

  /**
   * Update a user's last login timestamp
   *
   * @param userId User ID
   */
  private async updateLastLogin(userId: string): Promise<void> {
    const query = `
      UPDATE users
      SET last_login = NOW()
      WHERE id = $1
    `;

    try {
      await this.pool.query(query, [userId]);
    } catch (error) {
      console.error('Error updating last login:', error);
      // Non-critical error, don't throw
    }
  }

  /**
   * Find a user by email or username
   *
   * @param email User email
   * @param username User username
   * @returns User object if found, null otherwise
   */
  private async findUserByEmailOrUsername(email: string, username: string): Promise<User | null> {
    if (!email && !username) {
      return null;
    }

    let query = '';
    let values = [];

    if (email && username) {
      query = `
        SELECT * FROM users
        WHERE email = $1 OR username = $2
        LIMIT 1
      `;
      values = [email, username];
    } else if (email) {
      query = `
        SELECT * FROM users
        WHERE email = $1
        LIMIT 1
      `;
      values = [email];
    } else {
      query = `
        SELECT * FROM users
        WHERE username = $1
        LIMIT 1
      `;
      values = [username];
    }

    try {
      const result = await this.pool.query(query, values);
      if (result.rows.length === 0) {
        return null;
      }
      return this.mapUserFromDatabase(result.rows[0]);
    } catch (error) {
      console.error('Error finding user by email or username:', error);
      throw error;
    }
  }

  /**
   * Get a user by ID
   *
   * @param id User ID
   * @returns User object if found, null otherwise
   */
  async getUserById(id: string): Promise<User | null> {
    const query = `
      SELECT * FROM users
      WHERE id = $1
      LIMIT 1
    `;

    try {
      const result = await this.pool.query(query, [id]);
      if (result.rows.length === 0) {
        return null;
      }
      return this.mapUserFromDatabase(result.rows[0]);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * Map database user record to User interface
   *
   * @param dbUser Database user record
   * @returns User object
   */
  private mapUserFromDatabase(dbUser: any): User {
    return {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      passwordHash: dbUser.password_hash,
      status: dbUser.status,
      avatarUrl: dbUser.avatar_url,
      lastLogin: dbUser.last_login,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
    };
  }
}
