const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const {
  createQuote,
  getQuotesByRequestId,
  getQuoteById,
  updateQuote,
  sendQuote,
  approveQuote,
  rejectQuote,
  getAllQuotes,
  deleteQuote,
} = require('../controllers/quoteController');

// 견적서 생성 (관리자)
router.post(
  '/',
  adminAuth,
  [
    body('quote_request_id').isInt().withMessage('견적요청 ID는 정수여야 합니다.'),
  ],
  createQuote
);

// 특정 견적요청의 모든 견적서 조회 (인증 사용자)
router.get('/request/:request_id', auth, getQuotesByRequestId);

// 모든 견적서 조회 (관리자)
router.get('/', adminAuth, getAllQuotes);

// 특정 견적서 조회 (인증 사용자)
router.get('/:id', auth, getQuoteById);

// 견적서 업데이트 (관리자)
router.put(
  '/:id',
  adminAuth,
  [
    body('total_amount').optional().isNumeric().withMessage('총액은 숫자여야 합니다.'),
  ],
  updateQuote
);

// 견적서 발송 (관리자)
router.post('/:id/send', adminAuth, sendQuote);

// 견적서 승인 (인증 사용자)
router.post('/:id/approve', auth, approveQuote);

// 견적서 거절 (인증 사용자)
router.post('/:id/reject', auth, rejectQuote);

// 견적서 삭제 (관리자)
router.delete('/:id', adminAuth, deleteQuote);

module.exports = router;