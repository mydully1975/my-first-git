const pool = require('../config/database');

class Payment {
  static async create({
    contract_id,
    amount,
    payment_method,
    payment_type = 'full',
    transaction_id = null,
  }) {
    const query = `
      INSERT INTO payments (contract_id, amount, payment_method, payment_type, transaction_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [contract_id, amount, payment_method, payment_type, transaction_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT p.*, c.contract_number, c.user_id, u.name as user_name, u.email as user_email
      FROM payments p
      LEFT JOIN contracts c ON p.contract_id = c.id
      LEFT JOIN users u ON c.user_id = u.id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByContractId(contract_id) {
    const query = 'SELECT * FROM payments WHERE contract_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [contract_id]);
    return result.rows;
  }

  static async findByUserId(user_id, { limit = 10, offset = 0 } = {}) {
    const query = `
      SELECT p.*, c.contract_number, c.status as contract_status
      FROM payments p
      LEFT JOIN contracts c ON p.contract_id = c.id
      WHERE c.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [user_id, limit, offset]);
    return result.rows;
  }

  static async findByTransactionId(transaction_id) {
    const query = 'SELECT * FROM payments WHERE transaction_id = $1';
    const result = await pool.query(query, [transaction_id]);
    return result.rows[0];
  }

  static async findByPgTransactionId(pg_transaction_id) {
    const query = 'SELECT * FROM payments WHERE pg_transaction_id = $1';
    const result = await pool.query(query, [pg_transaction_id]);
    return result.rows[0];
  }

  static async findAll({ limit = 10, offset = 0, status } = {}) {
    let query = `
      SELECT p.*, c.contract_number, u.name as user_name, u.email as user_email
      FROM payments p
      LEFT JOIN contracts c ON p.contract_id = c.id
      LEFT JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND p.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async update(id, updates) {
    const setClause = Object.keys(updates)
      .map((key, index) => {
        if (key === 'pg_response') {
          return `${key} = $${index + 2}::jsonb`;
        }
        return `${key} = $${index + 2}`;
      })
      .join(', ');
    const query = `
      UPDATE payments
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
      UPDATE payments
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async completePayment(id, pg_transaction_id, pg_response) {
    const query = `
      UPDATE payments
      SET status = 'completed',
          pg_transaction_id = $2,
          pg_response = $3,
          paid_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id, pg_transaction_id, JSON.stringify(pg_response)]);
    return result.rows[0];
  }

  static async failPayment(id, pg_response) {
    const query = `
      UPDATE payments
      SET status = 'failed',
          pg_response = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id, JSON.stringify(pg_response)]);
    return result.rows[0];
  }

  static async refund(id, refund_amount, refund_reason) {
    const query = `
      UPDATE payments
      SET status = 'refunded',
          refund_amount = $2,
          refund_reason = $3,
          refunded_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id, refund_amount, refund_reason]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM payments WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getCount({ status } = {}) {
    let query = 'SELECT COUNT(*) as count FROM payments WHERE 1=1';
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
      SELECT COALESCE(SUM(p.amount), 0) as total_revenue
      FROM payments p
      WHERE p.status = 'completed'
    `;
    const params = [];

    if (startDate) {
      params.push(startDate);
      query += ` AND p.paid_at >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND p.paid_at <= $${params.length}`;
    }

    const result = await pool.query(query, params);
    return parseFloat(result.rows[0].total_revenue);
  }

  static async getRefundTotal({ startDate, endDate } = {}) {
    let query = `
      SELECT COALESCE(SUM(p.refund_amount), 0) as total_refund
      FROM payments p
      WHERE p.status = 'refunded'
    `;
    const params = [];

    if (startDate) {
      params.push(startDate);
      query += ` AND p.refunded_at >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND p.refunded_at <= $${params.length}`;
    }

    const result = await pool.query(query, params);
    return parseFloat(result.rows[0].total_refund);
  }
}

module.exports = Payment;