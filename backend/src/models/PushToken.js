const pool = require('../config/database');

class PushToken {
  static async create({
    user_id,
    token,
    platform,
    device_info,
  }) {
    const query = `
      INSERT INTO push_tokens (user_id, token, platform, device_info)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, token) 
      DO UPDATE SET is_active = true, device_info = $4, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const values = [
      user_id,
      token,
      platform,
      device_info ? JSON.stringify(device_info) : null,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM push_tokens WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByUserId(user_id, { is_active = true } = {}) {
    let query = 'SELECT * FROM push_tokens WHERE user_id = $1';
    const params = [user_id];
    let paramCount = 1;

    if (is_active !== undefined) {
      paramCount++;
      query += ` AND is_active = $${paramCount}`;
      params.push(is_active);
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findByToken(token) {
    const query = 'SELECT * FROM push_tokens WHERE token = $1';
    const result = await pool.query(query, [token]);
    return result.rows[0];
  }

  static async findAll({ limit = 10, offset = 0, platform, is_active } = {}) {
    let query = 'SELECT * FROM push_tokens WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (platform) {
      paramCount++;
      query += ` AND platform = $${paramCount}`;
      params.push(platform);
    }

    if (is_active !== undefined) {
      paramCount++;
      query += ` AND is_active = $${paramCount}`;
      params.push(is_active);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async update(id, updates) {
    const setClause = Object.keys(updates)
      .map((key, index) => {
        if (key === 'device_info') {
          return `${key} = $${index + 2}::jsonb`;
        }
        return `${key} = $${index + 2}`;
      })
      .join(', ');
    const query = `
      UPDATE push_tokens
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const values = [id, ...Object.values(updates)];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async deactivate(id) {
    const query = `
      UPDATE push_tokens
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async deactivateByToken(token) {
    const query = `
      UPDATE push_tokens
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE token = $1
      RETURNING *
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM push_tokens WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async deleteByUserId(user_id) {
    const query = 'DELETE FROM push_tokens WHERE user_id = $1 RETURNING *';
    const result = await pool.query(query, [user_id]);
    return result.rows;
  }

  static async getCount({ platform, is_active } = {}) {
    let query = 'SELECT COUNT(*) as count FROM push_tokens WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (platform) {
      paramCount++;
      query += ` AND platform = $${paramCount}`;
      params.push(platform);
    }

    if (is_active !== undefined) {
      paramCount++;
      query += ` AND is_active = $${paramCount}`;
      params.push(is_active);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }

  static async getActiveTokensByPlatform(platform) {
    const query = `
      SELECT pt.*, u.name as user_name, u.email as user_email
      FROM push_tokens pt
      LEFT JOIN users u ON pt.user_id = u.id
      WHERE pt.platform = $1 AND pt.is_active = true
      ORDER BY pt.created_at DESC
    `;
    const result = await pool.query(query, [platform]);
    return result.rows;
  }
}

module.exports = PushToken;