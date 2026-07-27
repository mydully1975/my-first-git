-- 테스트 데이터 생성 스크립트
-- 개발 및 테스트 환경용

-- 관리자 계정 생성
INSERT INTO users (email, password_hash, name, phone, role) VALUES
('admin@quoteservice.com', '$2a$10$rKZjYQZ4Y4Y4Y4Y4Y4Y4YuXQZ4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y', '시스템 관리자', '010-0000-0000', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 테스트 사용자 계정 생성
INSERT INTO users (email, password_hash, name, phone, role) VALUES
('user1@test.com', '$2a$10$rKZjYQZ4Y4Y4Y4Y4Y4Y4YuXQZ4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y', '테스트 사용자1', '010-1111-1111', 'user'),
('user2@test.com', '$2a$10$rKZjYQZ4Y4Y4Y4Y4Y4Y4YuXQZ4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y', '테스트 사용자2', '010-2222-2222', 'user'),
('user3@test.com', '$2a$10$rKZjYQZ4Y4Y4Y4Y4Y4Y4YuXQZ4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y', '테스트 사용자3', '010-3333-3333', 'user')
ON CONFLICT (email) DO NOTHING;

-- 카테고리 데이터 생성
INSERT INTO categories (name, description, parent_id, sort_order, is_active) VALUES
('홈 인테리어', '홈 인테리어 서비스', NULL, 1, true),
('주방 리모델링', '주방 리모델링 서비스', 1, 1, true),
('욕실 리모델링', '욕실 리모델링 서비스', 1, 2, true),
('거실 인테리어', '거실 인테리어 서비스', 1, 3, true),
('사무실 인테리어', '사무실 인테리어 서비스', NULL, 2, true),
('상업 공간', '상업 공간 인테리어', 5, 1, true),
('오피스텔', '오피스텔 인테리어', 5, 2, true),
('외부 인테리어', '외부 인테리어 서비스', NULL, 3, true),
('조경', '조경 및 정원 꾸미기', 7, 1, true),
‘데크 및 테라스', '데크 및 테라스 시공', 7, 2, true)
ON CONFLICT DO NOTHING;

-- 테스트 견적 요청 생성
INSERT INTO quote_requests (user_id, category_id, title, description, location, budget, status, preferred_date) VALUES
(2, 2, '주방 리모델링 견적 요청', '기존 주방을 전면 리모델링하고 싶습니다. 싱크대와 붙박이장 교체 필요.', '서울시 강남구 역삼동', 5000000, 'pending', '2026-08-01'),
(2, 3, '욕실 리모델링 견적 요청', '욕실 타일 교체 및 위생장치 교체가 필요합니다.', '서울시 강남구 청담동', 3000000, 'in_progress', '2026-07-20'),
(3, 6, '상업 공간 인테리어', '카페 인테리어를 원합니다. 50평 규모입니다.', '서울시 마포구 홍대입구', 15000000, 'completed', '2026-09-01')
ON CONFLICT DO NOTHING;

-- 테스트 견적서 생성
INSERT INTO quotes (quote_request_id, admin_id, title, description, price, valid_until, status) VALUES
(1, 1, '주방 리모델링 견적서', '주방 전면 리모델링 (싱크대, 붙박이장, 타일 포함)', 4800000, '2026-08-15', 'sent'),
(2, 1, '욕실 리모델링 견적서', '욕실 리모델링 (타일, 위생장치 포함)', 2800000, '2026-08-01', 'approved')
ON CONFLICT DO NOTHING;

-- 테스트 계약서 생성
INSERT INTO contracts (quote_id, user_id, contract_number, total_amount, start_date, end_date, terms, status) VALUES
(2, 2, 'CTR-2026-0001', 2800000, '2026-07-25', '2026-08-10', '계약 조건: 시공 기간 준수, 자재 비용 포함, 사후 보증 1년', 'signed')
ON CONFLICT DO NOTHING;

-- 테스트 결제 생성
INSERT INTO payments (contract_id, user_id, amount, payment_method, payment_status, transaction_id) VALUES
(1, 2, 2800000, 'credit_card', 'completed', 'TXN-2026-0001')
ON CONFLICT DO NOTHING;

-- 테스트 일정 생성
INSERT INTO schedules (contract_id, assigned_to, title, description, scheduled_date, scheduled_time, location, status, notes) VALUES
(1, 1, '시공 시작 미팅', '시공 시작 전 현장 확인 및 미팅', '2026-07-25', '09:00:00', '서울시 강남구 청담동', 'completed', '고객 요청사항 확인'),
(1, 1, '자재 반입', '시공所需 자재 반입', '2026-07-26', '10:00:00', '서울시 강남구 청담동', 'completed', NULL),
(1, 1, '타일 철거', '기존 타일 철거 작업', '2026-07-27', '09:00:00', '서울시 강남구 청담동', 'in_progress', '안전 장비 착용 필요')
ON CONFLICT DO NOTHING;

-- 테스트 리뷰 생성
INSERT INTO reviews (contract_id, user_id, rating, content, pros, cons, is_verified) VALUES
(1, 2, 5, '시공 결과에 매우 만족합니다. 친절하고 시간을 잘 지켰습니다.', '시공 품질 우수, 사후 관리 철저', '초기 일정 조금 변경됨', true)
ON CONFLICT DO NOTHING;

-- 테스트 채팅방 생성
INSERT INTO chat_rooms (contract_id, user_id, title, status, last_message_at) VALUES
(1, 2, '계약서 CTR-2026-0001 채팅방', 'active', '2026-07-10')
ON CONFLICT DO NOTHING;

-- 테스트 채팅 메시지 생성
INSERT INTO chat_messages (chat_room_id, sender_id, sender_role, message, is_read) VALUES
(1, 2, 'user', '안녕하세요, 시공 일정에 대해 문의드립니다.', true),
(1, 1, 'admin', '네, 7월 25일부터 시공 시작 예정입니다.', true),
(1, 2, 'user', '알겠습니다. 준비 잘 부탁드립니다.', true)
ON CONFLICT DO NOTHING;

-- 테스트 알림 생성
INSERT INTO notifications (user_id, type, title, content, data, is_read) VALUES
(2, 'schedule_update', '일정 업데이트 알림', '내일 시공이 시작됩니다.', '{"schedule_id": 1, "date": "2026-07-25"}', false),
(2, 'payment_complete', '결제 완료 알림', '결제가 완료되었습니다.', '{"payment_id": 1, "amount": 2800000}', true)
ON CONFLICT DO NOTHING;

-- 테스트 푸시 토큰 생성
INSERT INTO push_tokens (user_id, token, platform, device_info, is_active) VALUES
(2, 'test_token_ios_user2', 'ios', '{"device": "iPhone 14", "os_version": "iOS 17.0"}', true),
(3, 'test_token_android_user3', 'android', '{"device": "Samsung Galaxy S23", "os_version": "Android 13"}', true)
ON CONFLICT DO NOTHING;
