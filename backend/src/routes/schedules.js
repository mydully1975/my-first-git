const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const {
  createSchedule,
  getMySchedules,
  getContractSchedules,
  getAssignedSchedules,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  updateScheduleStatus,
  deleteSchedule,
  getUpcomingSchedules,
} = require('../controllers/scheduleController');

// 일정 생성 (인증 사용자)
router.post(
  '/',
  auth,
  [
    body('contract_id').isInt().withMessage('계약서 ID는 정수여야 합니다.'),
    body('title').notEmpty().withMessage('제목을 입력해주세요.'),
    body('scheduled_date').isISO8601().withMessage('올바른 날짜 형식이어야 합니다.'),
  ],
  createSchedule
);

// 내 일정 목록 조회 (인증 사용자)
router.get('/my', auth, getMySchedules);

// 내가 담당한 일정 목록 조회 (인증 사용자)
router.get('/assigned', auth, getAssignedSchedules);

// 계약서별 일정 조회 (인증 사용자)
router.get('/contract/:contract_id', auth, getContractSchedules);

// 다가오는 일정 조회 (인증 사용자)
router.get('/upcoming', auth, getUpcomingSchedules);

// 모든 일정 목록 조회 (관리자)
router.get('/', adminAuth, getAllSchedules);

// 특정 일정 조회 (인증 사용자)
router.get('/:id', auth, getScheduleById);

// 일정 업데이트 (인증 사용자)
router.put(
  '/:id',
  auth,
  [
    body('title').optional().notEmpty().withMessage('제목을 입력해주세요.'),
    body('scheduled_date').optional().isISO8601().withMessage('올바른 날짜 형식이어야 합니다.'),
  ],
  updateSchedule
);

// 일정 상태 업데이트 (인증 사용자)
router.put(
  '/:id/status',
  auth,
  [body('status').isIn(['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled']).withMessage('유효하지 않은 상태입니다.')],
  updateScheduleStatus
);

// 일정 삭제 (인증 사용자)
router.delete('/:id', auth, deleteSchedule);

module.exports = router;
