const pool = require('../config/database');

class Attachment {
  static async create({ quote_request_id, file_url, file_type, file_name, file_size }) {
    const query = `
      INSERT INTO attachments (quote_request_id, file_url, file_type, file_name, file_size)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [quote_request_id, file_url, file_type, file_name, file_size];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM attachments WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByRequestId(quote_request_id) {
    const query = 'SELECT * FROM attachments WHERE quote_request_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [quote_request_id]);
    return result.rows;
  }

  static async delete(id) {
    const query = 'DELETE FROM attachments WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async deleteByRequestId(quote_request_id) {
    const query = 'DELETE FROM attachments WHERE quote_request_id = $1 RETURNING *';
    const result = await pool.query(query, [quote_request_id]);
    return result.rows;
  }
}

module.exports = Attachment;