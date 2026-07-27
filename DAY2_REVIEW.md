# 2일차: 데이터베이스 스키마 검증 및 마이그레이션

## 수행 작업

### 1. 스키마 검증
- ✅ 12개 주요 테이블 구조 설계
- ✅ 외래키 제약조건 설정
- ✅ 인덱스 최적화 전략 수립
- ✅ 데이터 타입 적절성 검증

### 2. 데이터 무결성 테스트
- ✅ 기본키 고유성 확인
- ✅ 외래키 참조 무결성 테스트
- ✅ NOT NULL 제약조건 검증
- ✅ CHECK 제약조건 설정

### 3. 마이그레이션 스크립트 작성
- ✅ 초기 데이터 마이그레이션 스크립트 (schema.sql)
- ✅ 테스트 데이터 생성 스크립트 (seed.sql)
- ✅ 롤백 스크립트 작성 (rollback.sql)
- ✅ 마이그레이션 실행 스크립트 (migrate.js)
- ✅ 롤백 실행 스크립트 (rollback.js)

## 스키마 설계 검증 결과

### 테이블 구조 (12개)

#### 1. users (사용자 테이블)
```sql
- id: SERIAL PRIMARY KEY
- email: VARCHAR(255) UNIQUE NOT NULL
- password_hash: VARCHAR(255) NOT NULL
- name: VARCHAR(100) NOT NULL
- phone: VARCHAR(20)
- role: VARCHAR(20) CHECK (role IN ('user', 'admin'))
- created_at, updated_at: TIMESTAMP
```
**검증 결과**: ✅ 기본키, 고유 제약, 외래키 관계 적절

#### 2. categories (카테고리 테이블)
```sql
- id: SERIAL PRIMARY KEY
- name: VARCHAR(100) NOT NULL
- description: TEXT
- parent_id: INTEGER (자기 참조 외래키)
- sort_order: INTEGER DEFAULT 0
- is_active: BOOLEAN DEFAULT true
- created_at, updated_at: TIMESTAMP
```
**검증 결과**: ✅ 계층형 구조 지원, 정렬 기능 포함

#### 3. quote_requests (견적 요청 테이블)
```sql
- id: SERIAL PRIMARY KEY
- user_id: INTEGER NOT NULL (외래키)
- category_id: INTEGER (외래키)
- title: VARCHAR(200) NOT NULL
- description: TEXT NOT NULL
- location: VARCHAR(255)
- budget: DECIMAL(12, 2)
- status: VARCHAR(20) CHECK (상태값 제한)
- preferred_date: DATE
- created_at, updated_at: TIMESTAMP
```
**검증 결과**: ✅ 상태값 제한, 금액 데이터 타입 적절

#### 4. quotes (견적서 테이블)
```sql
- id: SERIAL PRIMARY KEY
- quote_request_id: INTEGER NOT NULL (외래키)
- admin_id: INTEGER (외래키)
- title: VARCHAR(200) NOT NULL
- description: TEXT
- price: DECIMAL(12, 2) NOT NULL
- valid_until: DATE
- status: VARCHAR(20) CHECK (상태값 제한)
- created_at, updated_at: TIMESTAMP
```
**검증 결과**: ✅ 견적 요청과 연결, 관리자 할당 기능

#### 5. contracts (계약서 테이블)
```sql
- id: SERIAL PRIMARY KEY
- quote_id: INTEGER NOT NULL (외래키)
- user_id: INTEGER NOT NULL (외래키)
- contract_number: VARCHAR(50) UNIQUE NOT NULL
- total_amount: DECIMAL(12, 2) NOT NULL
- start_date: DATE NOT NULL
- end_date: DATE NOT NULL
- terms: TEXT
- status: VARCHAR(20) CHECK (상태값 제한)
- user_signature: TEXT
- admin_signature: TEXT
- created_at, updated_at: TIMESTAMP
```
**검증 결과**: ✅ 계약번호 고유성, 서명 저장 기능

#### 6. payments (결제 테이블)
```sql
- id: SERIAL PRIMARY KEY
- contract_id: INTEGER NOT NULL (외래키)
- user_id: INTEGER NOT NULL (외래키)
- amount: DECIMAL(12, 2) NOT NULL
- payment_method: VARCHAR(50)
- payment_status: VARCHAR(20) CHECK (상태값 제한)
- transaction_id: VARCHAR(100)
- refund_amount: DECIMAL(12, 2) DEFAULT 0
- refund_reason: TEXT
- created_at, updated_at: TIMESTAMP
```
**검증 결과**: ✅ 환불 기능 지원, 거래 ID 저장

#### 7. schedules (일정 테이블)
```sql
- id: SERIAL PRIMARY KEY
- contract_id: INTEGER NOT NULL (외래키)
- assigned_to: INTEGER (외래키)
- title: VARCHAR(200) NOT NULL
- description: TEXT
- scheduled_date: DATE NOT NULL
- scheduled_time: TIME
- location: VARCHAR(255)
- status: VARCHAR(20) CHECK (상태값 제한)
- notes: TEXT
- completed_at: TIMESTAMP
- created_at, updated_at: TIMESTAMP
```
**검증 결과**: ✅ 담당자 할당, 완료 시간 추적

#### 8. reviews (리뷰 테이블)
```sql
- id: SERIAL PRIMARY KEY
- contract_id: INTEGER NOT NULL (외래키)
- user_id: INTEGER NOT NULL (외래키)
- rating: INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5)
- content: TEXT NOT NULL
- pros: TEXT
- cons: TEXT
- is_verified: BOOLEAN DEFAULT false
- created_at, updated_at: TIMESTAMP
```
**검증 결과**: ✅ 평점 범위 제한, 검증 기능

#### 9. chat_rooms (채팅방 테이블)
```sql
- id: SERIAL PRIMARY KEY
- contract_id: INTEGER NOT NULL (외래키)
- user_id: INTEGER NOT NULL (외래키)
- title: VARCHAR(200)
- status: VARCHAR(20) CHECK (상태값 제한)
- last_message_at: TIMESTAMP
- created_at, updated_at: TIMESTAMP
```
**검증 결과**: ✅ 계약서별 채팅방, 상태 관리

#### 10. chat_messages (채팅 메시지 테이블)
```sql
- id: SERIAL PRIMARY KEY
- chat_room_id: INTEGER NOT NULL (외래키)
- sender_id: INTEGER NOT NULL (외래키)
- sender_role: VARCHAR(20) CHECK (sender_role IN ('user', 'admin'))
- message: TEXT NOT NULL
- is_read: BOOLEAN DEFAULT false
- created_at, updated_at: TIMESTAMP
```
**검증 결과**: ✅ 발신자 역할 구분, 읽음 상태

#### 11. notifications (알림 테이블)
```sql
- id: SERIAL PRIMARY KEY
- user_id: INTEGER NOT NULL (외래키)
- type: VARCHAR(50) NOT NULL
- title: VARCHAR(200) NOT NULL
- content: TEXT
- data: JSONB
- is_read: BOOLEAN DEFAULT false
- created_at, updated_at: TIMESTAMP
```
**검증 결과**: ✅ JSONB 데이터 타입, 유연한 데이터 저장

#### 12. push_tokens (푸시 토큰 테이블)
```sql
- id: SERIAL PRIMARY KEY
- user_id: INTEGER NOT NULL (외래키)
- token: VARCHAR(500) NOT NULL
- platform: VARCHAR(20) CHECK (platform IN ('ios', 'android'))
- device_info: JSONB
- is_active: BOOLEAN DEFAULT true
- created_at, updated_at: TIMESTAMP
```
**검증 결과**: ✅ 플랫폼 구분, 기기 정보 저장

### 인덱스 최적화

#### 주요 인덱스 (24개)
- **사용자 관련**: idx_users_email, idx_quote_requests_user_id
- **상태 관련**: idx_quote_requests_status, idx_schedules_status
- **외래키 관련**: 모든 외래키 컬럼에 인덱스
- **검색 최적화**: idx_contracts_contract_number, idx_reviews_rating

**검증 결과**: ✅ 자주 조회되는 컬럼에 인덱스 적용, 중복 인덱스 없음

### 데이터 무결성

#### 제약조건 검증
- **기본키**: 모든 테이블에 SERIAL PRIMARY KEY 설정 ✅
- **외래키**: 참조 무결성 보장, ON DELETE CASCADE/SET NULL 설정 ✅
- **고유성**: email, contract_number에 UNIQUE 제약 ✅
- **NOT NULL**: 필수 컬럼에 NOT NULL 제약 ✅
- **CHECK**: 상태값, 평점 범위 등 CHECK 제약 ✅

**검증 결과**: ✅ ACID 트랜잭션 무결성 보장

### 자동화 기능

#### updated_at 자동 업데이트
- **트리거 함수**: update_updated_at_column() 생성
- **트리거 적용**: 모든 12개 테이블에 BEFORE UPDATE 트리거
- **기능**: updated_at 컬럼 자동으로 현재 시간으로 업데이트

**검증 결과**: ✅ 데이터 수정 시 자동 타임스탬프 업데이트

## 마이그레이션 스크립트

### 1. schema.sql (241줄)
- 모든 테이블 생성 문
- 인덱스 생성 문
- 트리거 함수 및 트리거 생성 문
- 실행 방법: `node database/migrate.js`

### 2. seed.sql (87줄)
- 관리자 계정 (1개)
- 테스트 사용자 계정 (3개)
- 카테고리 데이터 (10개)
- 견적 요청 데이터 (3개)
- 견적서 데이터 (2개)
- 계약서 데이터 (1개)
- 결제 데이터 (1개)
- 일정 데이터 (3개)
- 리뷰 데이터 (1개)
- 채팅방 데이터 (1개)
- 채팅 메시지 데이터 (3개)
- 알림 데이터 (2개)
- 푸시 토큰 데이터 (2개)
- 실행 방법: `node database/migrate.js --seed`

### 3. rollback.sql (61줄)
- 트리거 삭제 문
- 트리거 함수 삭제 문
- 인덱스 삭제 문
- 테이블 삭제 문 (역순)
- 실행 방법: `node database/rollback.js`

### 4. migrate.js (66줄)
- PostgreSQL 연결 설정
- 트랜잭션 관리
- 스크립트 파일 읽기 및 실행
- 에러 처리 및 롤백
- 시드 데이터 옵션 (--seed)

### 5. rollback.js (57줄)
- PostgreSQL 연결 설정
- 트랜잭션 관리
- 롤백 스크립트 실행
- 에러 처리 및 롤백

## 성능 최적화

### 쿼리 성능 고려사항
1. **인덱스 전략**: 자주 조회되는 컬럼에 인덱스 적용
2. **데이터 타입**: 적절한 데이터 타입 선택 (DECIMAL(12,2) 등)
3. **외래키**: 참조 무결성과 성능 균형
4. **JSONB**: 유연한 데이터 저장과 쿼리 성능

### 확장성 고려사항
1. **분할 가능성**: 대량 데이터 테이블은 향후 파티셔닝 고려
2. **아카이빙**: 오래된 데이터 아카이빙 전략 수립 가능
3. **읽기 전용**: 리플리카 설정을 통한 읽기 성능 향상 가능

## 2일차 결론

### 완료된 작업
- ✅ 12개 테이블 스키마 설계 완료
- ✅ 24개 인덱스 최적화 완료
- ✅ 데이터 무결성 제약조건 설정 완료
- ✅ 마이그레이션 스크립트 5개 작성 완료
- ✅ 테스트 데이터 생성 스크립트 작성 완료
- ✅ 롤백 스크립트 작성 완료

### 검증 결과
- **스키마 설계**: 100% 완료 및 검증
- **데이터 무결성**: 모든 제약조건 적절히 설정
- **성능 최적화**: 인덱스 전략 수립 완료
- **자동화**: 마이그레이션/롤백 자동화 완료

### 개선 필요 사항
1. **파티셔닝**: 대량 데이터 테이블의 파티셔닝 전략 고려
2. **아카이빙**: 오래된 데이터 아카이빙 정책 수립
3. **모니터링**: 데이터베이스 성능 모니터링 도구 설정

### 다음 단계 (3일차)
- 백엔드 API 단위 테스트 작성
- 통합 테스트 수행
- API 문서화 작업

---

*검증 일자: 2026-07-10*
*검증자: 20년차 개발자*
*상태: 2일차 작업 완료*
