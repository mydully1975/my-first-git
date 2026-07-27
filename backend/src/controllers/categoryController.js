const Category = require('../models/Category');
const { adminAuth } = require('../middleware/auth');

const getAllCategories = async (req, res) => {
  try {
    const { parent_id } = req.query;
    const categories = await Category.findAll({ parent_id });
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: '카테고리 조회에 실패했습니다.' });
  }
};

const getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.getTree();
    res.json({ categories });
  } catch (error) {
    console.error('Get category tree error:', error);
    res.status(500).json({ error: '카테고리 트리 조회에 실패했습니다.' });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ error: '카테고리를 찾을 수 없습니다.' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: '카테고리 조회에 실패했습니다.' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, parent_id, description, base_price } = req.body;

    const category = await Category.create({
      name,
      parent_id,
      description,
      base_price,
    });

    res.status(201).json({
      message: '카테고리가 생성되었습니다.',
      category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: '카테고리 생성에 실패했습니다.' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const category = await Category.update(id, updates);

    if (!category) {
      return res.status(404).json({ error: '카테고리를 찾을 수 없습니다.' });
    }

    res.json({
      message: '카테고리가 업데이트되었습니다.',
      category,
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: '카�레고리 업데이트에 실패했습니다.' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.delete(id);

    if (!category) {
      return res.status(404).json({ error: '카테고리를 찾을 수 없습니다.' });
    }

    res.json({
      message: '카테고리가 삭제되었습니다.',
      category,
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: '카테고리 삭제에 실패했습니다.' });
  }
};

module.exports = {
  getAllCategories,
  getCategoryTree,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};