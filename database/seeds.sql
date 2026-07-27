-- 시드 데이터

-- 관리자 계정 생성 (비밀번호: admin123)
INSERT INTO users (email, password_hash, name, phone, role) VALUES
('admin@quoteservice.com', '$2a$10$rOzJZ3Z3Z3Z3Z3Z3Z3Z3ZeKZ3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3', '관리자', '010-0000-0000', 'admin');

-- 카테고리 데이터
INSERT INTO categories (name, parent_id, description, base_price) VALUES
('홈 인테리어', NULL, '집 인테리어 관련 서비스', 0),
('이사', NULL, '이사 관련 서비스', 0),
('청소', NULL, '청소 관련 서비스', 0),
('수리', NULL, '수리 관련 서비스', 0);

-- 하위 카테고리
INSERT INTO categories (name, parent_id, description, base_price) VALUES
('도배', 1, '벽지 교체 및 도배 작업', 50000),
('장판', 1, '장판 및 바닥재 시공', 80000),
('조명', 1, '조명 설치 및 교체', 30000),
('가구 조립', 1, '가구 조립 및 설치', 20000),
('원룸 이사', 2, '원룸 이사 서비스', 100000),
('투룸 이사', 2, '투룸 이사 서비스', 150000),
('오피스텔 이사', 2, '오피스텔 이사 서비스', 200000),
('입주 청소', 3, '입주 전 청소 서비스', 150000),
(' regularly 청소', 3, '정기 청소 서비스', 80000),
('대청소', 3, '주기적 대청소 서비스', 200000),
('가전 수리', 4, '가전제품 수리', 30000),
('배관 수리', 4, '배관 및 수도 수리', 40000),
('전기 수리', 4, '전기 설비 수리', 35000),
('도어락 수리', 4, '도어락 설치 및 수리', 25000);

-- 테스트용 일반 사용자
INSERT INTO users (email, password_hash, name, phone, role) VALUES
('test@example.com', '$2a$10$rOzJZ3Z3Z3Z3Z3Z3Z3Z3ZeKZ3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3Z3', '테스트 사용자', '010-1234-5678', 'customer');