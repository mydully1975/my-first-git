const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const {
  createContract,
  getMyContracts,
  getAllContracts,
  getContractById,
  signContract,
  updateContract,
  cancelContract,
  completeContract,
} = require('../controllers/contractController');

// 계약서 생성 (인증 사용자)
router.post(
  '/',
  auth,
  [
    body('quote_id').isInt().withMessage('견적서 ID는 정수여야 합니다.'),
  ],
  createContract
);

// 내 계약서 목록 조회 (인증 사용자)
router.get('/my', auth, getMyContracts);

// 모든 계약서 목록 조회 (관리자)
router.get('/', adminAuth, getAllContracts);

// 특정 계약서 조회 (인증 사용자)
router.get('/:id', auth, getContractById);

// 계약서 서명 (인증 사용자)
router.post('/:id/sign', auth, signContract);

// 계약서 업데이트 (관리자)
router.put(
  '/:id',
  adminAuth,
  [
    body('terms').optional().notEmpty().withMessage('약관을 입력해주세요.'),
  ],
  updateContract
);

// 계약서 취소 (인증 사용자)
router.post('/:id/cancel', auth, cancelContract);

// 계약 완료 (관리자)
router.post('/:id/complete', adminAuth, completeContract);

module.exports = router;