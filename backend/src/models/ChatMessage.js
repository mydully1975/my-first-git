const pool = require('../config/database');

class ChatMessage {
  static async create({
    chat_room_id,
    sender_id,
    message,
    message_type = 'text',
    file_url,
  }) {
    const query = `
      INSERT INTO chat_messages (chat_room_id, sender_id, message, message_type, file_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [chat_room_id, sender_id, message, message_type, file_url];
    const result = await pool.query(query, values);

    // 채팅방의 last_message_at 업데이트
    await pool.query(
      'UPDATE chat_rooms SET last_message_at = CURRENT_TIMESTAMP WHERE id = $1',
      [chat_room_id]
    );

    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT cm.*, u.name as sender_name, u.role as sender_role
      FROM chat_messages cm
      LEFT JOIN users u ON cm.sender_id = u.id
      WHERE cm.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByChatRoomId(chat_room_id, { limit = 50, offset = 0 } = {}) {
    const query = `
      SELECT cm.*, u.name as sender_name, u.role as sender_role
      FROM chat_messages cm
      LEFT JOIN users u ON cm.sender_id = u.id
      WHERE cm.chat_room_id = $1
      ORDER BY cm.created_at ASC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [chat_room_id, limit, offset]);
    return result.rows;
  }

  static async findUnreadByUser(user_id, { limit = 20, offset = 0 } = {}) {
    const query = `
      SELECT cm.*, cr.id as chat_room_id, cr.title as chat_room_title,
             u.name as sender_name, u.role as sender_role
      FROM chat_messages cm
      INNER JOIN chat_rooms cr ON cm.chat_room_id = cr.id
      LEFT JOIN users u ON cm.sender_id = u.id
      WHERE (cr.user_id = $1 OR cr.admin_id = $1)
        AND cm.sender_id != $1
        AND cm.is_read = false
      ORDER BY cm.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [user_id, limit, offset]);
    return result.rows;
  }

  static async findAll({ limit = 10, offset = 0, chat_room_id, sender_id } = {}) {
    let query = `
      SELECT cm.*, u.name as sender_name, u.role as sender_role
      FROM chat_messages cm
      LEFT JOIN users u ON cm.sender_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (chat_room_id) {
      paramCount++;
      query += ` AND cm.chat_room_id = $${paramCount}`;
      params.push(chat_room_id);
    }

    if (sender_id) {
      paramCount++;
      query += ` AND cm.sender_id = $${paramCount}`;
      params.push(sender_id);
    }

    query += ` ORDER BY cm.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async markAsRead(id) {
    const query = `
      UPDATE chat_messages
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async markRoomAsRead(chat_room_id, user_id) {
    const query = `
      UPDATE chat_messages
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE chat_room_id = $1 AND sender_id != $2 AND is_read = false
      RETURNING *
    `;
    const result = await pool.query(query, [chat_room_id, user_id]);
    return result.rows;
  }

  static async delete(id) {
    const query = 'DELETE FROM chat_messages WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getCount({ chat_room_id, sender_id } = {}) {
    let query = 'SELECT COUNT(*) as count FROM chat_messages WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (chat_room_id) {
      paramCount++;
      query += ` AND chat_room_id = $${paramCount}`;
      params.push(chat_room_id);
    }

    if (sender_id) {
      paramCount++;
      query += ` AND sender_id = $${paramCount}`;
      params.push(sender_id);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }

  static async getLatestMessage(chat_room_id) {
    const query = `
      SELECT cm.*, u.name as sender_name, u.role as sender_role
      FROM chat_messages cm
      LEFT JOIN users u ON cm.sender_id = u.id
      WHERE cm.chat_room_id = $1
      ORDER BY cm.created_at DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [chat_room_id]);
    return result.rows[0];
  }
}

module.exports = ChatMessage;