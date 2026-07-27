const pool = require('../config/database');

class QuoteRequest {
  static async create({
    user_id,
    category_id,
    title,
    description,
    requirements,
    budget_min,
    budget_max,
    preferred_date,
  }) {
    const query = `
      INSERT INTO quote_requests (user_id, category_id, title, description, requirements, budget_min, budget_max, preferred_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      user_id,
      category_id,
      title,
      description,
      JSON.stringify(requirements || {}),
      budget_min,
      budget_max,
      preferred_date,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT qr.*, u.name as user_name, u.email as user_email, c.name as category_name
      FROM quote_requests qr
      LEFT JOIN users u ON qr.user_id = u.id
      LEFT JOIN categories c ON qr.category_id = c.id
      WHERE qr.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByUserId(user_id, { limit = 10, offset = 0 } = {}) {
    const query = `
      SELECT qr.*, c.name as category_name
      FROM quote_requests qr
      LEFT JOIN categories c ON qr.category_id = c.id
      WHERE qr.user_id = $1
      ORDER BY qr.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [user_id, limit, offset]);
    return result.rows;
  }

  static async findAll({ limit = 10, offset = 0, status, category_id } = {}) {
    let query = `
      SELECT qr.*, u.name as user_name, u.email as user_email, c.name as category_name
      FROM quote_requests qr
      LEFT JOIN users u ON qr.user_id = u.id
      LEFT JOIN categories c ON qr.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND qr.status = $${paramCount}`;
      params.push(status);
    }

    if (category_id) {
      paramCount++;
      query += ` AND qr.category_id = $${paramCount}`;
      params.push(category_id);
    }

    query += ` ORDER BY qr.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async update(id, updates) {
    const setClause = Object.keys(updates)
      .map((key, index) => {
        if (key === 'requirements') {
          return `${key} = $${index + 2}::jsonb`;
        }
        return `${key} = $${index + 2}`;
      })
      .join(', ');
    const query = `
      UPDATE quote_requests
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const values = [id, ...Object.values(updates)];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE quote_requests
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM quote_requests WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getCount({ status, category_id } = {}) {
    let query = 'SELECT COUNT(*) as count FROM quote_requests WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (category_id) {
      paramCount++;
      query += ` AND category_id = $${paramCount}`;
      params.push(category_id);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }
}

module.exports = QuoteRequest;