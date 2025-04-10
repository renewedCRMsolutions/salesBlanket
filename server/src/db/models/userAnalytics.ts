import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export interface UserAnalyticsData {
  userId: string;
  entityId?: string;
  action: string;
  occurredAt?: Date;
  ipAddress?: string;
  device?: {
    os?: string;    // Operating system
    br?: string;    // Browser
    sr?: string;    // Screen resolution
    dv?: string;    // Device type
  };
  geo?: {
    co?: string;    // Country
    ct?: string;    // City
    rg?: string;    // Region
    lt?: number;    // Latitude
    ln?: number;    // Longitude
  };
  meta?: Record<string, any>;  // Event-specific metadata
  perf?: {
    lt?: number;    // Load time (ms)
    rt?: number;    // Response time (ms)
    tt?: number;    // Total time (ms)
  };
}

export class UserAnalytics {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Track a user analytics event
   * 
   * @param data The analytics data to track
   * @returns The created analytics record ID
   */
  async trackEvent(data: UserAnalyticsData): Promise<string> {
    const id = uuidv4();
    const now = new Date();

    const query = `
      INSERT INTO user_analytics (
        id, user_id, entity_id, action, occurred_at, ip_address, 
        device, geo, meta, perf
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `;

    const values = [
      id,
      data.userId,
      data.entityId || null,
      data.action,
      data.occurredAt || now,
      data.ipAddress || null,
      JSON.stringify(data.device || {}),
      JSON.stringify(data.geo || {}),
      JSON.stringify(data.meta || {}),
      JSON.stringify(data.perf || {})
    ];

    try {
      const result = await this.pool.query(query, values);
      return result.rows[0].id;
    } catch (error) {
      console.error('Error tracking analytics event:', error);
      throw error;
    }
  }

  /**
   * Get analytics for a specific user
   * 
   * @param userId The user ID to get analytics for
   * @param limit Maximum number of records to return
   * @param offset Pagination offset
   * @returns Array of analytics records
   */
  async getUserAnalytics(userId: string, limit = 100, offset = 0) {
    const query = `
      SELECT * FROM user_analytics
      WHERE user_id = $1
      ORDER BY occurred_at DESC
      LIMIT $2 OFFSET $3
    `;

    try {
      const result = await this.pool.query(query, [userId, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw error;
    }
  }

  /**
   * Get aggregated analytics for a time period
   * 
   * @param startDate Start of the period
   * @param endDate End of the period
   * @param groupBy Grouping field (action, user_id, etc)
   * @returns Aggregated analytics data
   */
  async getAggregatedAnalytics(startDate: Date, endDate: Date, groupBy = 'action') {
    const validGroupBy = ['action', 'user_id', 'entity_id', 'ip_address'].includes(groupBy) 
      ? groupBy 
      : 'action';

    const query = `
      SELECT ${validGroupBy}, COUNT(*) as count
      FROM user_analytics
      WHERE occurred_at BETWEEN $1 AND $2
      GROUP BY ${validGroupBy}
      ORDER BY count DESC
    `;

    try {
      const result = await this.pool.query(query, [startDate, endDate]);
      return result.rows;
    } catch (error) {
      console.error('Error getting aggregated analytics:', error);
      throw error;
    }
  }
}