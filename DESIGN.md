# 견적요청/견적서 서비스 기본 설계

## 1. 시스템 개요

### 1.1 서비스 목적
고객이 앱을 통해 서비스/제품에 대한 견적을 요청하고, 관리자가 반자동으로 견적서를 발송하는 통합 서비스

### 1.2 타겟 사용자
- 일반 고객 (서비스/제품 이용자)
- 관리자 (견적 담당자)

### 1.3 플랫폼
- 하이브리드 앱 (React Native 또는 Flutter)
- 관리자 웹 대시보드

---

## 2. 기능 아키텍처

### 2.1 고객 앱 기능

#### 견적요청
- 서비스/제품 카테고리 선택
- 상세 요구사항 입력 (텍스트, 이미지, 파일 첨부)
- 희망 일정 및 예산 설정
- 견적요청 전송

#### 견적서 확인
- 견적서 수신 알림
- 견적서 상세 보기 (금액, 내역, 조건)
- 견적서 비교 (다수 견적서 수신 시)

#### 결제 및 계약
- 견적서 승인
- 결제 진행 (결제 게이트웨이 연동)
- 계약서 전자 서명
- 결제 내역 조회

#### 일정 관리
- 서비스 진행 일정 확인
- 알림 설정 (진행 상태, 일정 변경)
- 진행 상태 트래킹

#### 마이페이지
- 내 견적요청 내역
- 계약 진행 내역
- 결제 내역
- 프로필 관리

### 2.2 관리자 웹 기능

#### 견적 관리
- 견적요청 목록 조회
- 자동 견적 계산 (기본 알고리즘)
- 견적서 수정 및 발송
- 견적서 템플릿 관리

#### 고객 관리
- 고객 정보 조회
- 견적 이력 관리
- 상담 이력 관리

#### 결제 관리
- 결제 내역 조회
- 환불 처리
- 결제 상태 관리

#### 일정 관리
- 서비스 일정 등록
- 진행 상태 업데이트
- 일정 변경 알림

#### 대시보드
- 견적 통계 (요청/발송/승인율)
- 매출 통계
- 직원 성과 관리

---

## 3. 데이터베이스 설계

### 3.1 주요 테이블

#### Users (사용자)
- id (PK)
- email
- password_hash
- name
- phone
- role (customer/admin)
- created_at
- updated_at

#### Categories (카테고리)
- id (PK)
- name
- parent_id (FK)
- description
- base_price

#### QuoteRequests (견적요청)
- id (PK)
- user_id (FK)
- category_id (FK)
- title
- description
- requirements (JSON)
- budget_min
- budget_max
- preferred_date
- status (pending/quoting/completed/cancelled)
- created_at
- updated_at

#### Quotes (견적서)
- id (PK)
- quote_request_id (FK)
- admin_id (FK)
- total_amount
- breakdown (JSON)
- valid_until
- status (draft/sent/approved/rejected/expired)
- notes
- created_at
- updated_at

#### Contracts (계약)
- id (PK)
- quote_id (FK)
- user_id (FK)
- contract_number
- signed_at
- status (active/completed/cancelled)
- contract_pdf_url
- created_at
- updated_at

#### Payments (결제)
- id (PK)
- contract_id (FK)
- amount
- payment_method
- status (pending/completed/failed/refunded)
- transaction_id
- paid_at
- created_at
- updated_at

#### Schedules (일정)
- id (PK)
- contract_id (FK)
- title
- scheduled_date
- status (scheduled/in_progress/completed/cancelled)
- notes
- created_at
- updated_at

#### Attachments (첨부파일)
- id (PK)
- quote_request_id (FK)
- file_url
- file_type
- file_name
- created_at

---

## 4. 기술 스택 추천

### 4.1 프론트엔드 (하이브리드 앱)
- **React Native** 또는 **Flutter**
- 상태 관리: Redux / MobX / Provider
- 네비게이션: React Navigation / Flutter Navigator

### 4.2 백엔드
- **Node.js + Express** 또는 **Python + FastAPI**
- 인증: JWT
- 파일 스토리지: AWS S3 또는 Firebase Storage

### 4.3 데이터베이스
- **PostgreSQL** (관계형 데이터) 또는 **MongoDB** (문서형)
- 캐싱: Redis

### 4.4 인프라
- **AWS** 또는 **Google Cloud**
- CI/CD: GitHub Actions
- 모니터링: Sentry, DataDog

### 4.5 결제 연동
- KG이니시스, 나이스페이먼츠, 토스페이먼츠
- 또는 Stripe (해외 진출 시)

---

## 5. API 설계 (RESTful)

### 5.1 인증
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout

### 5.2 견적요청
- GET /api/quotes/requests
- POST /api/quotes/requests
- GET /api/quotes/requests/:id
- PUT /api/quotes/requests/:id
- DELETE /api/quotes/requests/:id

### 5.3 견적서
- GET /api/quotes
- POST /api/quotes
- GET /api/quotes/:id
- PUT /api/quotes/:id
- DELETE /api/quotes/:id
- POST /api/quotes/:id/send

### 5.4 계약
- GET /api/contracts
- POST /api/contracts
- GET /api/contracts/:id
- PUT /api/contracts/:id/sign

### 5.5 결제
- POST /api/payments/prepare
- POST /api/payments/confirm
- GET /api/payments/:id
- POST /api/payments/:id/refund

### 5.6 일정
- GET /api/schedules
- POST /api/schedules
- GET /api/schedules/:id
- PUT /api/schedules/:id

---

## 6. 보안 고려사항

### 6.1 인증/인가
- JWT 토큰 기반 인증
- Refresh Token 구현
- Role-based Access Control (RBAC)

### 6.2 데이터 보호
- HTTPS 통신 강제
- 민감 정보 암호화 (결제 정보, 개인정보)
- SQL Injection 방지
- XSS 방지

### 6.3 결제 보안
- PCI DSS 준수
- 결제 정보 직접 처리 회피 (PG사 연동)
- 결제 로그 저장

---

## 7. 개발 단계별 계획 (3단계)

### Phase 1: 핵심 기능 (MVP)
**목표**: 견적요청부터 견적서 발송까지의 핵심 프로세스 구현

#### 백엔드
- 사용자 인증 시스템 (JWT)
- 카테고리 관리 API
- 견적요청 CRUD API
- 견적서 자동 계산 알고리즘
- 견적서 발송 API
- 관리자 인증 및 권한 관리
- 기본 대시보드 API

#### 프론트엔드 (고객 앱)
- 회원가입/로그인 화면
- 카테고리 선택 화면
- 견적요청 작성 화면 (텍스트, 이미지 첨부)
- 내 견적요청 목록
- 견적서 상세 보기
- 푸시 알림 기본 구현

#### 관리자 웹
- 관리자 로그인
- 견적요청 목록 및 상세 보기
- 자동 견적 계산 UI
- 견적서 수정 및 발송
- 기본 통계 대시보드

#### 데이터베이스
- Users, Categories, QuoteRequests, Quotes, Attachments 테이블 구현

---

### Phase 2: 결제 및 계약 시스템
**목표**: 실제 비즈니스 프로세스 완성 (결제 ~ 계약)

#### 백엔드
- 결제 시스템 연동 (PG사)
- 계약서 생성 API
- 전자 서명 API
- 결제 내역 관리 API
- 환불 처리 API
- 결제 상태 웹훅 처리
- 계약서 PDF 생성

#### 프론트엔드 (고객 앱)
- 견적서 승인 기능
- 결제 진행 화면
- 결제 수단 선택
- 계약서 전자 서명 화면
- 결제 내역 조회
- 계약 진행 상태 확인

#### 관리자 웹
- 결제 내역 조회
- 환불 처리 화면
- 계약서 관리
- 매출 통계 대시보드
- 결제 상태 모니터링

#### 데이터베이스
- Contracts, Payments 테이블 추가
- 기존 테이블 관계 확장

---

### Phase 3: 서비스 관리 및 고급 기능
**목표**: 서비스 품질 향상 및 사용자 경험 개선

#### 백엔드
- 일정 관리 API
- 진행 상태 트래킹 API
- 실시간 알림 시스템 (FCM/APNs)
- 채팅 시스템 (WebSocket)
- 리뷰 시스템 API
- 추천 알고리즘 기본 구현
- 고급 분석 및 리포팅

#### 프론트엔드 (고객 앱)
- 서비스 일정 캘린더
- 진행 상태 트래커
- 실시간 알림
- 1:1 채팅 기능
- 서비스 리뷰 작성
- 추천 서비스 표시
- 마이페이지 고급화

#### 관리자 웹
- 서비스 일정 등록 및 관리
- 진행 상태 업데이트
- 직원 할당 및 성과 관리
- 채팅 모니터링
- 리뷰 관리
- 고급 분석 대시보드
- 고객 만족도 리포트

#### 데이터베이스
- Schedules 테이블 추가
- 채팅, 리뷰 관련 테이블 추가
- 통계 및 분석 테이블 추가

---

## 8. 향후 확장 고려사항

- 다국어 지원
- 푸시 알림 개선
- AI 기반 견적 자동화
- 분석/리포팅 강화
- B2B 기능 추가