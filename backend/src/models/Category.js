const pool = require('../config/database');

class Category {
  static async create({ name, parent_id, description, base_price }) {
    const query = `
      INSERT INTO categories (name, parent_id, description, base_price)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [name, parent_id, description, base_price];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM categories WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAll({ is_active = true, parent_id } = {}) {
    let query = 'SELECT * FROM categories WHERE is_active = $1';
    const params = [is_active];
    let paramCount = 1;

    if (parent_id !== undefined) {
      paramCount++;
      query += ` AND parent_id ${parent_id === null ? 'IS NULL' : `= $${paramCount}`}`;
      if (parent_id !== null) params.push(parent_id);
    }

    query += ' ORDER BY name ASC';
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async update(id, updates) {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    const query = `
      UPDATE categories
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const values = [id, ...Object.values(updates)];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'UPDATE categories SET is_active = false WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getTree() {
    const query = `
      WITH RECURSIVE category_tree AS (
        SELECT *, 0 as level
        FROM categories
        WHERE parent_id IS NULL AND is_active = true
        UNION ALL
        SELECT c.*, ct.level + 1
        FROM categories c
        INNER JOIN category_tree ct ON c.parent_id = ct.id
        WHERE c.is_active = true
      )
      SELECT * FROM category_tree ORDER BY parent_id NULLS FIRST, name
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = Category;