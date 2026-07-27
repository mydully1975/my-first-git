const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const {
  getDashboardStats,
  getQuoteRequestStats,
  getAdminPerformance,
} = require('../controllers/adminController');

// 대시보드 통계 조회 (관리자)
router.get('/dashboard', adminAuth, getDashboardStats);

// 견적요청 통계 조회 (관리자)
router.get('/stats/quote-requests', adminAuth, getQuoteRequestStats);

// 관리자 성과 조회 (관리자)
router.get('/performance/:admin_id', adminAuth, getAdminPerformance);

module.exports = router;