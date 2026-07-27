const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const {
  createChatRoom,
  getMyChatRooms,
  getAllChatRooms,
  getChatRoomById,
  updateChatRoom,
  closeChatRoom,
} = require('../controllers/chatRoomController');

// 채팅방 생성 (인증 사용자)
router.post(
  '/',
  auth,
  [
    body('contract_id').isInt().withMessage('계약서 ID는 정수여야 합니다.'),
  ],
  createChatRoom
);

// 내 채팅방 목록 조회 (인증 사용자)
router.get('/my', auth, getMyChatRooms);

// 모든 채팅방 목록 조회 (관리자)
router.get('/', adminAuth, getAllChatRooms);

// 특정 채팅방 조회 (인증 사용자)
router.get('/:id', auth, getChatRoomById);

// 채팅방 업데이트 (인증 사용자)
router.put(
  '/:id',
  auth,
  [
    body('title').optional().notEmpty().withMessage('제목을 입력해주세요.'),
  ],
  updateChatRoom
);

// 채팅방 닫기 (인증 사용자)
router.post('/:id/close', auth, closeChatRoom);

module.exports = router;
