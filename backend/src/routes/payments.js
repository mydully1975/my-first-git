const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const {
  preparePayment,
  completePayment,
  getMyPayments,
  getAllPayments,
  getPaymentById,
  refundPayment,
  getPaymentStats,
} = require('../controllers/paymentController');

// 결제 준비 (인증 사용자)
router.post(
  '/prepare',
  auth,
  [
    body('contract_id').isInt().withMessage('계약서 ID는 정수여야 합니다.'),
    body('payment_method').notEmpty().withMessage('결제 수단을 선택해주세요.'),
  ],
  preparePayment
);

// 결제 완료 (PG사 콜백)
router.post(
  '/complete',
  [
    body('transaction_id').notEmpty().withMessage('거래 ID가 필요합니다.'),
    body('pg_transaction_id').notEmpty().withMessage('PG사 거래 ID가 필요합니다.'),
  ],
  completePayment
);

// 내 결제 내역 조회 (인증 사용자)
router.get('/my', auth, getMyPayments);

// 모든 결제 내역 조회 (관리자)
router.get('/', adminAuth, getAllPayments);

// 결제 통계 조회 (관리자)
router.get('/stats', adminAuth, getPaymentStats);

// 특정 결제 내역 조회 (인증 사용자)
router.get('/:id', auth, getPaymentById);

// 결제 환불 (관리자)
router.post(
  '/:id/refund',
  adminAuth,
  [body('refund_reason').notEmpty().withMessage('환불 사유를 입력해주세요.')],
  refundPayment
);

module.exports = router;