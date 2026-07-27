const pool = require('../config/database');

class Quote {
  static async create({
    quote_request_id,
    admin_id,
    total_amount,
    breakdown,
    valid_until,
    notes,
  }) {
    const query = `
      INSERT INTO quotes (quote_request_id, admin_id, total_amount, breakdown, valid_until, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      quote_request_id,
      admin_id,
      total_amount,
      JSON.stringify(breakdown),
      valid_until,
      notes,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT q.*, qr.title as request_title, qr.description as request_description,
             u.name as admin_name, c.name as category_name
      FROM quotes q
      LEFT JOIN quote_requests qr ON q.quote_request_id = qr.id
      LEFT JOIN users u ON q.admin_id = u.id
      LEFT JOIN categories c ON qr.category_id = c.id
      WHERE q.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByRequestId(quote_request_id) {
    const query = `
      SELECT q.*, u.name as admin_name
      FROM quotes q
      LEFT JOIN users u ON q.admin_id = u.id
      WHERE q.quote_request_id = $1
      ORDER BY q.created_at DESC
    `;
    const result = await pool.query(query, [quote_request_id]);
    return result.rows;
  }

  static async findByAdminId(admin_id, { limit = 10, offset = 0 } = {}) {
    const query = `
      SELECT q.*, qr.title as request_title, qr.user_id as request_user_id,
             u_req.name as user_name, c.name as category_name
      FROM quotes q
      LEFT JOIN quote_requests qr ON q.quote_request_id = qr.id
      LEFT JOIN users u_req ON qr.user_id = u_req.id
      LEFT JOIN categories c ON qr.category_id = c.id
      WHERE q.admin_id = $1
      ORDER BY q.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [admin_id, limit, offset]);
    return result.rows;
  }

  static async findAll({ limit = 10, offset = 0, status } = {}) {
    let query = `
      SELECT q.*, qr.title as request_title, qr.user_id as request_user_id,
             u_req.name as user_name, u_admin.name as admin_name, c.name as category_name
      FROM quotes q
      LEFT JOIN quote_requests qr ON q.quote_request_id = qr.id
      LEFT JOIN users u_req ON qr.user_id = u_req.id
      LEFT JOIN users u_admin ON q.admin_id = u_admin.id
      LEFT JOIN categories c ON qr.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND q.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY q.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async update(id, updates) {
    const setClause = Object.keys(updates)
      .map((key, index) => {
        if (key === 'breakdown') {
          return `${key} = $${index + 2}::jsonb`;
        }
        return `${key} = $${index + 2}`;
      })
      .join(', ');
    const query = `
      UPDATE quotes
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
      UPDATE quotes
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM quotes WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getCount({ status } = {}) {
    let query = 'SELECT COUNT(*) as count FROM quotes WHERE 1=1';
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
}

module.exports = Quote;