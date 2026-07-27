const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const {
  createReview,
  getMyReviews,
  getContractReviews,
  getAllReviews,
  getReviewById,
  updateReview,
  verifyReview,
  deleteReview,
  getReviewStats,
} = require('../controllers/reviewController');

// 리뷰 작성 (인증 사용자)
router.post(
  '/',
  auth,
  [
    body('contract_id').isInt().withMessage('계약서 ID는 정수여야 합니다.'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('평점은 1-5 사이여야 합니다.'),
    body('rating').notEmpty().withMessage('평점을 입력해주세요.'),
  ],
  createReview
);

// 내 리뷰 목록 조회 (인증 사용자)
router.get('/my', auth, getMyReviews);

// 계약서별 리뷰 조회 (공개)
router.get('/contract/:contract_id', getContractReviews);

// 모든 리뷰 목록 조회 (공개)
router.get('/', getAllReviews);

// 리뷰 통계 조회 (공개)
router.get('/stats', getReviewStats);

// 특정 리뷰 조회 (공개)
router.get('/:id', getReviewById);

// 리뷰 업데이트 (인증 사용자)
router.put(
  '/:id',
  auth,
  [
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('평점은 1-5 사이여야 합니다.'),
  ],
  updateReview
);

// 리뷰 검증 (관리자)
router.post('/:id/verify', adminAuth, verifyReview);

// 리뷰 삭제 (인증 사용자)
router.delete('/:id', auth, deleteReview);

module.exports = router;
