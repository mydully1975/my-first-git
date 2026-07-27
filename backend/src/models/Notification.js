const pool = require('../config/database');

class Notification {
  static async create({
    user_id,
    type,
    title,
    content,
    data,
  }) {
    const query = `
      INSERT INTO notifications (user_id, type, title, content, data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      user_id,
      type,
      title,
      content,
      data ? JSON.stringify(data) : null,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM notifications WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByUserId(user_id, { limit = 20, offset = 0, is_read } = {}) {
    let query = 'SELECT * FROM notifications WHERE user_id = $1';
    const params = [user_id];
    let paramCount = 1;

    if (is_read !== undefined) {
      paramCount++;
      query += ` AND is_read = $${paramCount}`;
      params.push(is_read);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findAll({ limit = 10, offset = 0, type, is_read } = {}) {
    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
    }

    if (is_read !== undefined) {
      paramCount++;
      query += ` AND is_read = $${paramCount}`;
      params.push(is_read);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async markAsRead(id) {
    const query = `
      UPDATE notifications
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async markAllAsRead(user_id) {
    const query = `
      UPDATE notifications
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND is_read = false
      RETURNING *
    `;
    const result = await pool.query(query, [user_id]);
    return result.rows;
  }

  static async delete(id) {
    const query = 'DELETE FROM notifications WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async deleteOld(days = 30) {
    const query = `
      DELETE FROM notifications
      WHERE created_at < CURRENT_DATE - INTERVAL '${days} days'
      RETURNING *
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getUnreadCount(user_id) {
    const query = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false';
    const result = await pool.query(query, [user_id]);
    return parseInt(result.rows[0].count);
  }

  static async getCount({ type, is_read } = {}) {
    let query = 'SELECT COUNT(*) as count FROM notifications WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
    }

    if (is_read !== undefined) {
      paramCount++;
      query += ` AND is_read = $${paramCount}`;
      params.push(is_read);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Notification;