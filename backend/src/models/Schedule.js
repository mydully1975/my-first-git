const pool = require('../config/database');

class Schedule {
  static async create({
    contract_id,
    title,
    description,
    scheduled_date,
    scheduled_time,
    assigned_to,
    location,
    notes,
  }) {
    const query = `
      INSERT INTO schedules (contract_id, title, description, scheduled_date, scheduled_time, assigned_to, location, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      contract_id,
      title,
      description,
      scheduled_date,
      scheduled_time,
      assigned_to,
      location,
      notes,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT s.*, c.contract_number, u.name as assigned_name
      FROM schedules s
      LEFT JOIN contracts c ON s.contract_id = c.id
      LEFT JOIN users u ON s.assigned_to = u.id
      WHERE s.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByContractId(contract_id) {
    const query = `
      SELECT s.*, u.name as assigned_name
      FROM schedules s
      LEFT JOIN users u ON s.assigned_to = u.id
      WHERE s.contract_id = $1
      ORDER BY s.scheduled_date ASC, s.scheduled_time ASC
    `;
    const result = await pool.query(query, [contract_id]);
    return result.rows;
  }

  static async findByUserId(user_id, { limit = 10, offset = 0 } = {}) {
    const query = `
      SELECT s.*, c.contract_number, c.status as contract_status
      FROM schedules s
      LEFT JOIN contracts c ON s.contract_id = c.id
      WHERE c.user_id = $1
      ORDER BY s.scheduled_date ASC, s.scheduled_time ASC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [user_id, limit, offset]);
    return result.rows;
  }

  static async findByAssignedTo(assigned_to, { limit = 10, offset = 0 } = {}) {
    const query = `
      SELECT s.*, c.contract_number, cu.name as customer_name
      FROM schedules s
      LEFT JOIN contracts c ON s.contract_id = c.id
      LEFT JOIN users cu ON c.user_id = cu.id
      WHERE s.assigned_to = $1
      ORDER BY s.scheduled_date ASC, s.scheduled_time ASC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [assigned_to, limit, offset]);
    return result.rows;
  }

  static async findAll({ limit = 10, offset = 0, status, date_from, date_to } = {}) {
    let query = `
      SELECT s.*, c.contract_number, u.name as assigned_name, cu.name as customer_name
      FROM schedules s
      LEFT JOIN contracts c ON s.contract_id = c.id
      LEFT JOIN users u ON s.assigned_to = u.id
      LEFT JOIN users cu ON c.user_id = cu.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND s.status = $${paramCount}`;
      params.push(status);
    }

    if (date_from) {
      paramCount++;
      query += ` AND s.scheduled_date >= $${paramCount}`;
      params.push(date_from);
    }

    if (date_to) {
      paramCount++;
      query += ` AND s.scheduled_date <= $${paramCount}`;
      params.push(date_to);
    }

    query += ` ORDER BY s.scheduled_date ASC, s.scheduled_time ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async update(id, updates) {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    const query = `
      UPDATE schedules
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
      UPDATE schedules
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM schedules WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getCount({ status, date_from, date_to } = {}) {
    let query = 'SELECT COUNT(*) as count FROM schedules WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (date_from) {
      paramCount++;
      query += ` AND scheduled_date >= $${paramCount}`;
      params.push(date_from);
    }

    if (date_to) {
      paramCount++;
      query += ` AND scheduled_date <= $${paramCount}`;
      params.push(date_to);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }

  static async getUpcomingSchedules(days = 7) {
    const query = `
      SELECT s.*, c.contract_number, u.name as assigned_name
      FROM schedules s
      LEFT JOIN contracts c ON s.contract_id = c.id
      LEFT JOIN users u ON s.assigned_to = u.id
      WHERE s.scheduled_date >= CURRENT_DATE
        AND s.scheduled_date <= CURRENT_DATE + INTERVAL '${days} days'
        AND s.status IN ('scheduled', 'in_progress')
      ORDER BY s.scheduled_date ASC, s.scheduled_time ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = Schedule;