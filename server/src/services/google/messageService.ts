// server/src/services/messageService.ts
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export interface PulseMessage {
  id: string;
  collectionId: string;
  senderId: string;
  senderRole?: string;
  messageText: string;
  entityId?: string;
  entityType?: string;
  messageType: 'CHAT' | 'ACTIVITY' | 'NOTIFICATION' | 'SYSTEM';
  visibilityLevel: string;
  isExternalVisible: boolean;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageFilter {
  collectionId?: string;
  entityId?: string;
  entityType?: string;
  senderId?: string;
  messageType?: string;
  visibilityLevel?: string;
  isExternalVisible?: boolean;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

export class MessageService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Create a new message
   * @param message - Message data
   * @returns Created message
   */
  async createMessage(
    message: Omit<PulseMessage, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PulseMessage> {
    const id = uuidv4();
    const now = new Date();

    const query = `
      INSERT INTO entity_card_pulse_messages (
        id, collection_id, sender_id, sender_role, message_text,
        entity_id, entity_type, message_type, visibility_level,
        is_external_visible, metadata, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12
      ) RETURNING *
    `;

    const values = [
      id,
      message.collectionId,
      message.senderId,
      message.senderRole || null,
      message.messageText,
      message.entityId || null,
      message.entityType || null,
      message.messageType,
      message.visibilityLevel,
      message.isExternalVisible,
      message.metadata ? JSON.stringify(message.metadata) : null,
      now,
    ];

    try {
      const result = await this.pool.query(query, values);
      return this.mapMessageFromDatabase(result.rows[0]);
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  /**
   * Get messages by filter
   * @param filter - Message filter
   * @param userRole - User role for visibility filtering
   * @param isExternal - Whether the user is external
   * @returns Array of messages
   */
  async getMessages(
    filter: MessageFilter,
    userRole: string,
    isExternal: boolean = false
  ): Promise<PulseMessage[]> {
    let query = `
      SELECT m.* FROM entity_card_pulse_messages m
      JOIN entity_card_pulse_role_levels rl1 ON m.visibility_level = rl1.role
      JOIN entity_card_pulse_role_levels rl2 ON $1 = rl2.role
      WHERE rl2.access_level >= rl1.access_level
    `;

    const values: any[] = [userRole];
    let paramIndex = 2;

    // Add filters
    if (filter.collectionId) {
      query += ` AND m.collection_id = $${paramIndex++}`;
      values.push(filter.collectionId);
    }

    if (filter.entityId) {
      query += ` AND m.entity_id = $${paramIndex++}`;
      values.push(filter.entityId);
    }

    if (filter.entityType) {
      query += ` AND m.entity_type = $${paramIndex++}`;
      values.push(filter.entityType);
    }

    if (filter.senderId) {
      query += ` AND m.sender_id = $${paramIndex++}`;
      values.push(filter.senderId);
    }

    if (filter.messageType) {
      query += ` AND m.message_type = $${paramIndex++}`;
      values.push(filter.messageType);
    }

    if (filter.fromDate) {
      query += ` AND m.created_at >= $${paramIndex++}`;
      values.push(filter.fromDate);
    }

    if (filter.toDate) {
      query += ` AND m.created_at <= $${paramIndex++}`;
      values.push(filter.toDate);
    }

    // External users can only see messages marked as external visible
    if (isExternal) {
      query += ` AND m.is_external_visible = TRUE`;
    }

    // Order by creation date (newest first)
    query += ` ORDER BY m.created_at DESC`;

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
      return result.rows.map(this.mapMessageFromDatabase);
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  /**
   * Get a message by ID
   * @param messageId - Message ID
   * @returns Message or null if not found
   */
  async getMessageById(messageId: string): Promise<PulseMessage | null> {
    const query = `
      SELECT * FROM entity_card_pulse_messages
      WHERE id = $1
    `;

    try {
      const result = await this.pool.query(query, [messageId]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapMessageFromDatabase(result.rows[0]);
    } catch (error) {
      console.error('Error getting message by ID:', error);
      throw error;
    }
  }

  /**
   * Update message read status for a user
   * @param collectionId - Collection ID
   * @param userId - User ID
   * @param lastReadMessageId - Last read message ID
   * @returns Boolean indicating success
   */
  async updateReadStatus(
    collectionId: string,
    userId: string,
    lastReadMessageId: string
  ): Promise<boolean> {
    const now = new Date();

    const query = `
      INSERT INTO entity_card_pulse_message_read_status (
        id, collection_id, user_id, last_read_message_id, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $5
      ) ON CONFLICT (collection_id, user_id) DO UPDATE SET
        last_read_message_id = $4,
        updated_at = $5
      RETURNING id
    `;

    try {
      await this.pool.query(query, [uuidv4(), collectionId, userId, lastReadMessageId, now]);
      return true;
    } catch (error) {
      console.error('Error updating read status:', error);
      return false;
    }
  }

  /**
   * Get unread message count for a user
   * @param collectionId - Collection ID
   * @param userId - User ID
   * @returns Number of unread messages
   */
  async getUnreadCount(collectionId: string, userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count FROM entity_card_pulse_messages m
      WHERE m.collection_id = $1
      AND (
        SELECT last_read_message_id FROM entity_card_pulse_message_read_status
        WHERE collection_id = $1 AND user_id = $2
      ) IS NULL OR m.created_at > (
        SELECT mrs.updated_at FROM entity_card_pulse_message_read_status mrs
        WHERE mrs.collection_id = $1 AND mrs.user_id = $2
      )
    `;

    try {
      const result = await this.pool.query(query, [collectionId, userId]);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Delete a message
   * @param messageId - Message ID
   * @returns Boolean indicating success
   */
  async deleteMessage(messageId: string): Promise<boolean> {
    const query = `
      DELETE FROM entity_card_pulse_messages
      WHERE id = $1
      RETURNING id
    `;

    try {
      const result = await this.pool.query(query, [messageId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }

  /**
   * Map database message to PulseMessage interface
   * @param dbMessage - Database message record
   * @returns PulseMessage object
   */
  private mapMessageFromDatabase(dbMessage: any): PulseMessage {
    return {
      id: dbMessage.id,
      collectionId: dbMessage.collection_id,
      senderId: dbMessage.sender_id,
      senderRole: dbMessage.sender_role,
      messageText: dbMessage.message_text,
      entityId: dbMessage.entity_id,
      entityType: dbMessage.entity_type,
      messageType: dbMessage.message_type,
      visibilityLevel: dbMessage.visibility_level,
      isExternalVisible: dbMessage.is_external_visible,
      metadata: dbMessage.metadata,
      createdAt: dbMessage.created_at,
      updatedAt: dbMessage.updated_at,
    };
  }
}
