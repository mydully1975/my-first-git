const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { adminAuth } = require('../middleware/auth');
const {
  getAllCategories,
  getCategoryTree,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

// 모든 카테고리 조회 (공개)
router.get('/', getAllCategories);

// 카테고리 트리 조회 (공개)
router.get('/tree', getCategoryTree);

// 특정 카테고리 조회 (공개)
router.get('/:id', getCategoryById);

// 카테고리 생성 (관리자만)
router.post(
  '/',
  adminAuth,
  [
    body('name').notEmpty().withMessage('카테고리 이름을 입력해주세요.'),
    body('base_price').isNumeric().withMessage('기본 가격은 숫자여야 합니다.'),
  ],
  createCategory
);

// 카테고리 업데이트 (관리자만)
router.put(
  '/:id',
  adminAuth,
  [
    body('name').optional().notEmpty().withMessage('카테고리 이름을 입력해주세요.'),
    body('base_price').optional().isNumeric().withMessage('기본 가격은 숫자여야 합니다.'),
  ],
  updateCategory
);

// 카테고리 삭제 (관리자만)
router.delete('/:id', adminAuth, deleteCategory);

module.exports = router;