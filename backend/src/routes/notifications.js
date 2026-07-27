const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const {
  createNotification,
  getMyNotifications,
  getAllNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  registerPushToken,
  unregisterPushToken,
  getUnreadCount,
} = require('../controllers/notificationController');

// 알림 생성 (인증 사용자/관리자)
router.post(
  '/',
  auth,
  [
    body('user_id').isInt().withMessage('사용자 ID는 정수여야 합니다.'),
    body('type').notEmpty().withMessage('알림 타입을 입력해주세요.'),
    body('title').notEmpty().withMessage('제목을 입력해주세요.'),
  ],
  createNotification
);

// 내 알림 목록 조회 (인증 사용자)
router.get('/my', auth, getMyNotifications);

// 모든 알림 목록 조회 (관리자)
router.get('/', adminAuth, getAllNotifications);

// 읽지 않은 알림 수 조회 (인증 사용자)
router.get('/unread-count', auth, getUnreadCount);

// 특정 알림 조회 (인증 사용자)
router.get('/:id', auth, getNotificationById);

// 알림 읽음 처리 (인증 사용자)
router.post('/:id/read', auth, markAsRead);

// 전체 알림 읽음 처리 (인증 사용자)
router.post('/read-all', auth, markAllAsRead);

// 알림 삭제 (인증 사용자)
router.delete('/:id', auth, deleteNotification);

// 푸시 토큰 등록 (인증 사용자)
router.post(
  '/push-token',
  auth,
  [
    body('token').notEmpty().withMessage('토큰을 입력해주세요.'),
    body('platform').isIn(['ios', 'android']).withMessage('플랫폼은 ios 또는 android여야 합니다.'),
  ],
  registerPushToken
);

// 푸시 토큰 해제 (인증 사용자)
router.post('/push-token/unregister', auth, unregisterPushToken);

module.exports = router;
