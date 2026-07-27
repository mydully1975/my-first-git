const pool = require('../config/database');

class ChatRoom {
  static async create({
    contract_id,
    user_id,
    admin_id,
    title,
  }) {
    const query = `
      INSERT INTO chat_rooms (contract_id, user_id, admin_id, title)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [contract_id, user_id, admin_id, title];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT cr.*, c.contract_number, u.name as user_name, a.name as admin_name
      FROM chat_rooms cr
      LEFT JOIN contracts c ON cr.contract_id = c.id
      LEFT JOIN users u ON cr.user_id = u.id
      LEFT JOIN users a ON cr.admin_id = a.id
      WHERE cr.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByContractId(contract_id) {
    const query = `
      SELECT cr.*, u.name as user_name, a.name as admin_name
      FROM chat_rooms cr
      LEFT JOIN users u ON cr.user_id = u.id
      LEFT JOIN users a ON cr.admin_id = a.id
      WHERE cr.contract_id = $1
      ORDER BY cr.created_at DESC
    `;
    const result = await pool.query(query, [contract_id]);
    return result.rows[0];
  }

  static async findByUserId(user_id, { limit = 10, offset = 0 } = {}) {
    const query = `
      SELECT cr.*, c.contract_number, 
             CASE 
               WHEN cr.user_id = $1 THEN a.name
               ELSE u.name
             END as other_user_name
      FROM chat_rooms cr
      LEFT JOIN contracts c ON cr.contract_id = c.id
      LEFT JOIN users u ON cr.user_id = u.id
      LEFT JOIN users a ON cr.admin_id = a.id
      WHERE cr.user_id = $1 OR cr.admin_id = $1
      ORDER BY cr.last_message_at DESC NULLS LAST
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [user_id, limit, offset]);
    return result.rows;
  }

  static async findAll({ limit = 10, offset = 0, status } = {}) {
    let query = `
      SELECT cr.*, c.contract_number, u.name as user_name, a.name as admin_name
      FROM chat_rooms cr
      LEFT JOIN contracts c ON cr.contract_id = c.id
      LEFT JOIN users u ON cr.user_id = u.id
      LEFT JOIN users a ON cr.admin_id = a.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND cr.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY cr.last_message_at DESC NULLS LAST LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async update(id, updates) {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    const query = `
      UPDATE chat_rooms
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const values = [id, ...Object.values(updates)];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateLastMessage(id) {
    const query = `
      UPDATE chat_rooms
      SET last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE chat_rooms
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM chat_rooms WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getCount({ status } = {}) {
    let query = 'SELECT COUNT(*) as count FROM chat_rooms WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }

  static async getUnreadCount(user_id) {
    const query = `
      SELECT COUNT(*) as count
      FROM chat_messages cm
      INNER JOIN chat_rooms cr ON cm.chat_room_id = cr.id
      WHERE cr.user_id = $1 OR cr.admin_id = $1
        AND cm.sender_id != $1
        AND cm.is_read = false
    `;
    const result = await pool.query(query, [user_id]);
    return parseInt(result.rows[0].count);
  }
}

module.exports = ChatRoom;