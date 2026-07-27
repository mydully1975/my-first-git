const pool = require('../config/database');

class Review {
  static async create({
    contract_id,
    user_id,
    rating,
    title,
    content,
    service_quality,
    communication,
    timeliness,
    images,
  }) {
    const query = `
      INSERT INTO reviews (contract_id, user_id, rating, title, content, service_quality, communication, timeliness, images)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      contract_id,
      user_id,
      rating,
      title,
      content,
      service_quality,
      communication,
      timeliness,
      images ? JSON.stringify(images) : null,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT r.*, c.contract_number, u.name as user_name, cat.name as category_name
      FROM reviews r
      LEFT JOIN contracts c ON r.contract_id = c.id
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN quotes q ON c.quote_id = q.id
      LEFT JOIN quote_requests qr ON q.quote_request_id = qr.id
      LEFT JOIN categories cat ON qr.category_id = cat.id
      WHERE r.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByContractId(contract_id) {
    const query = `
      SELECT r.*, u.name as user_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.contract_id = $1
    `;
    const result = await pool.query(query, [contract_id]);
    return result.rows;
  }

  static async findByUserId(user_id, { limit = 10, offset = 0 } = {}) {
    const query = `
      SELECT r.*, c.contract_number, cat.name as category_name
      FROM reviews r
      LEFT JOIN contracts c ON r.contract_id = c.id
      LEFT JOIN quotes q ON c.quote_id = q.id
      LEFT JOIN quote_requests qr ON q.quote_request_id = qr.id
      LEFT JOIN categories cat ON qr.category_id = cat.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [user_id, limit, offset]);
    return result.rows;
  }

  static async findAll({ limit = 10, offset = 0, rating, is_verified } = {}) {
    let query = `
      SELECT r.*, c.contract_number, u.name as user_name, cat.name as category_name
      FROM reviews r
      LEFT JOIN contracts c ON r.contract_id = c.id
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN quotes q ON c.quote_id = q.id
      LEFT JOIN quote_requests qr ON q.quote_request_id = qr.id
      LEFT JOIN categories cat ON qr.category_id = cat.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (rating) {
      paramCount++;
      query += ` AND r.rating = $${paramCount}`;
      params.push(rating);
    }

    if (is_verified !== undefined) {
      paramCount++;
      query += ` AND r.is_verified = $${paramCount}`;
      params.push(is_verified);
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async update(id, updates) {
    const setClause = Object.keys(updates)
      .map((key, index) => {
        if (key === 'images') {
          return `${key} = $${index + 2}::jsonb`;
        }
        return `${key} = $${index + 2}`;
      })
      .join(', ');
    const query = `
      UPDATE reviews
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const values = [id, ...Object.values(updates)];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async verify(id) {
    const query = `
      UPDATE reviews
      SET is_verified = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM reviews WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getCount({ rating, is_verified } = {}) {
    let query = 'SELECT COUNT(*) as count FROM reviews WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (rating) {
      paramCount++;
      query += ` AND rating = $${paramCount}`;
      params.push(rating);
    }

    if (is_verified !== undefined) {
      paramCount++;
      query += ` AND is_verified = $${paramCount}`;
      params.push(is_verified);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }

  static async getAverageRating() {
    const query = `
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        AVG(service_quality) as avg_service_quality,
        AVG(communication) as avg_communication,
        AVG(timeliness) as avg_timeliness
      FROM reviews
      WHERE is_verified = true
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }

  static async getRatingDistribution() {
    const query = `
      SELECT rating, COUNT(*) as count
      FROM reviews
      WHERE is_verified = true
      GROUP BY rating
      ORDER BY rating DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = Review;