const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const {
  createQuoteRequest,
  getMyQuoteRequests,
  getAllQuoteRequests,
  getQuoteRequestById,
  updateQuoteRequest,
  updateQuoteRequestStatus,
  deleteQuoteRequest,
} = require('../controllers/quoteRequestController');

// 견적요청 생성 (인증 사용자)
router.post(
  '/',
  auth,
  [
    body('category_id').isInt().withMessage('카테고리 ID는 정수여야 합니다.'),
    body('title').notEmpty().withMessage('제목을 입력해주세요.'),
    body('description').notEmpty().withMessage('설명을 입력해주세요.'),
    body('budget_min').optional().isNumeric().withMessage('최소 예산은 숫자여야 합니다.'),
    body('budget_max').optional().isNumeric().withMessage('최대 예산은 숫자여야 합니다.'),
  ],
  createQuoteRequest
);

// 내 견적요청 목록 조회 (인증 사용자)
router.get('/my', auth, getMyQuoteRequests);

// 모든 견적요청 목록 조회 (관리자)
router.get('/', adminAuth, getAllQuoteRequests);

// 특정 견적요청 조회 (인증 사용자)
router.get('/:id', auth, getQuoteRequestById);

// 견적요청 업데이트 (인증 사용자)
router.put(
  '/:id',
  auth,
  [
    body('title').optional().notEmpty().withMessage('제목을 입력해주세요.'),
    body('description').optional().notEmpty().withMessage('설명을 입력해주세요.'),
    body('budget_min').optional().isNumeric().withMessage('최소 예산은 숫자여야 합니다.'),
    body('budget_max').optional().isNumeric().withMessage('최대 예산은 숫자여야 합니다.'),
  ],
  updateQuoteRequest
);

// 견적요청 상태 업데이트 (관리자)
router.put(
  '/:id/status',
  adminAuth,
  [body('status').isIn(['pending', 'quoting', 'completed', 'cancelled']).withMessage('유효하지 않은 상태입니다.')],
  updateQuoteRequestStatus
);

// 견적요청 삭제 (인증 사용자)
router.delete('/:id', auth, deleteQuoteRequest);

module.exports = router;