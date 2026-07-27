const pool = require('../config/database');

class Contract {
  static async create({
    quote_id,
    user_id,
    total_amount,
    terms,
    start_date,
    end_date,
  }) {
    // 계약서 번호 생성
    const contractNumberResult = await pool.query('SELECT generate_contract_number() as contract_number');
    const contract_number = contractNumberResult.rows[0].contract_number;

    const query = `
      INSERT INTO contracts (quote_id, user_id, contract_number, total_amount, terms, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [quote_id, user_id, contract_number, total_amount, terms, start_date, end_date];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT c.*, q.total_amount as quote_amount, qr.title as quote_title,
             u.name as user_name, u.email as user_email
      FROM contracts c
      LEFT JOIN quotes q ON c.quote_id = q.id
      LEFT JOIN quote_requests qr ON q.quote_request_id = qr.id
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByQuoteId(quote_id) {
    const query = 'SELECT * FROM contracts WHERE quote_id = $1';
    const result = await pool.query(query, [quote_id]);
    return result.rows[0];
  }

  static async findByUserId(user_id, { limit = 10, offset = 0 } = {}) {
    const query = `
      SELECT c.*, qr.title as quote_title, cat.name as category_name
      FROM contracts c
      LEFT JOIN quotes q ON c.quote_id = q.id
      LEFT JOIN quote_requests qr ON q.quote_request_id = qr.id
      LEFT JOIN categories cat ON qr.category_id = cat.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [user_id, limit, offset]);
    return result.rows;
  }

  static async findByContractNumber(contract_number) {
    const query = 'SELECT * FROM contracts WHERE contract_number = $1';
    const result = await pool.query(query, [contract_number]);
    return result.rows[0];
  }

  static async findAll({ limit = 10, offset = 0, status } = {}) {
    let query = `
      SELECT c.*, u.name as user_name, u.email as user_email, qr.title as quote_title
      FROM contracts c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN quotes q ON c.quote_id = q.id
      LEFT JOIN quote_requests qr ON q.quote_request_id = qr.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND c.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY c.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async update(id, updates) {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    const query = `
      UPDATE contracts
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
      UPDATE contracts
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async sign(id) {
    const query = `
      UPDATE contracts
      SET status = 'active', signed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM contracts WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getCount({ status } = {}) {
    let query = 'SELECT COUNT(*) as count FROM contracts WHERE 1=1';
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

  static async getTotalRevenue({ startDate, endDate } = {}) {
    let query = `
      SELECT COALESCE(SUM(c.total_amount), 0) as total_revenue
      FROM contracts c
      WHERE c.status = 'active'
    `;
    const params = [];

    if (startDate) {
      params.push(startDate);
      query += ` AND c.created_at >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND c.created_at <= $${params.length}`;
    }

    const result = await pool.query(query, params);
    return parseFloat(result.rows[0].total_revenue);
  }
}

module.exports = Contract;