const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const { register, login, getProfile, updateProfile } = require('../controllers/authController');

// 회원가입
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('올바른 이메일 형식이어야 합니다.'),
    body('password').isLength({ min: 6 }).withMessage('비밀번호는 최소 6자 이상이어야 합니다.'),
    body('name').notEmpty().withMessage('이름을 입력해주세요.'),
  ],
  register
);

// 로그인
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('올바른 이메일 형식이어야 합니다.'),
    body('password').notEmpty().withMessage('비밀번호를 입력해주세요.'),
  ],
  login
);

// 프로필 조회
router.get('/profile', auth, getProfile);

// 프로필 업데이트
router.put('/profile', auth, updateProfile);

module.exports = router;