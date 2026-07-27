const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const {
  sendMessage,
  getChatRoomMessages,
  getUnreadMessages,
  markAsRead,
  deleteMessage,
} = require('../controllers/chatMessageController');

// 메시지 전송 (인증 사용자)
router.post(
  '/',
  auth,
  [
    body('chat_room_id').isInt().withMessage('채팅방 ID는 정수여야 합니다.'),
    body('message').notEmpty().withMessage('메시지를 입력해주세요.'),
  ],
  sendMessage
);

// 채팅방 메시지 조회 (인증 사용자)
router.get('/room/:chat_room_id', auth, getChatRoomMessages);

// 읽지 않은 메시지 조회 (인증 사용자)
router.get('/unread', auth, getUnreadMessages);

// 메시지 읽음 처리 (인증 사용자)
router.post('/:id/read', auth, markAsRead);

// 메시지 삭제 (인증 사용자)
router.delete('/:id', auth, deleteMessage);

module.exports = router;
