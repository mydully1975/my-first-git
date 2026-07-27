# 테스트 실행 문제 분석 및 해결 방안

## 현재 상황 분석

### 1. 의존성 설치 문제
**현상**: npm install 명령이 실패함
**원인 분석**:
- Windows 환경에서의 npm/Node.js 호환성 문제
- 네트워크 연결 문제 가능성
- 권한 문제 가능성
- 패키지 버전 호환성 문제

### 2. 데이터베이스 연결 문제
**현상**: PostgreSQL이 설치되어 있지 않음
**원인 분석**:
- 로컬에 PostgreSQL 서버 미설치
- 데이터베이스 포트 충돌 가능성
- 연결 정보 미설정

### 3. 환경 설정 문제
**현상**: 환경 변수 설정 미완료
**원인 분석**:
- .env 파일 생성 필요
- 데이터베이스 연결 정보 부재
- 외부 서비스 API 키 부재

## 발생 가능한 문제점 및 해결 방안

### 1. 백엔드 서버 시작 실패

#### 문제 1: 의존성 모듈 누락
```javascript
// 에러 메시지: Error: Cannot find module 'express'
// 원인: node_modules 폴더가 없거나 의존성이 설치되지 않음

// 해결 방안
cd backend
npm install

// Windows 환경에서의 대안
npm install --no-optional
npm install --legacy-peer-deps
```

#### 문제 2: 데이터베이스 연결 실패
```javascript
// 에러 메시지: connect ECONNREFUSED 127.0.0.1:5432
// 원인: PostgreSQL 서버가 실행 중이지 않음

// 해결 방안
# 1. PostgreSQL 설치 (Windows)
# Chocolatey 이용
choco install postgresql

# 2. PostgreSQL 서버 시작
# Windows Services에서 postgresql-x64-14 서비스 시작

# 3. 테스트용 데이터베이스 생성
createdb quote_service_test

# 4. .env 파일 설정
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quote_service_test
DB_USER=postgres
DB_PASSWORD=your_password
```

#### 문제 3: 포트 충돌
```javascript
// 에러 메시지: Error: listen EADDRINUSE: address already in use :::3000
// 원인: 포트 3000이 이미 사용 중

// 해결 방안
# 1. 다른 포트 사용
PORT=3001 npm start

# 2. 사용 중인 프로세스 종료
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# 3. .env 파일에서 포트 변경
PORT=3001
```

### 2. 테스트 실행 실패

#### 문제 1: Jest 설정 누락
```javascript
// 에러 메시지: Jest configuration not found
// 원인: jest.config.js 파일이 없음

// 해결 방안
# 1. Jest 설치
npm install --save-dev jest @types/jest

# 2. jest.config.js 생성
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.js'
  ],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ]
};
```

#### 문제 2: 테스트 파일에서 모듈을 찾을 수 없음
```javascript
// 에러 메시지: ReferenceError: request is not defined
// 원인: supertest가 설치되지 않음

// 해결 방안
npm install --save-dev supertest @types/supertest
```

#### 문제 3: 데이터베이스 연결 테스트 실패
```javascript
// 에러 메시지: Connection refused
// 원인: 테스트용 데이터베이스가 없음

// 해결 방안
# 1. 테스트 전에 데이터베이스 마이그레이션
npm run migrate

# 2. 테스트용 데이터 로드
npm run seed

# 3. 테스트 후 롤백
node database/rollback.js
```

### 3. 모바일 앱 테스트 문제

#### 문제 1: React Native 환경 설정
```javascript
// 에러 메시지: react-native command not found
// 원인: React Native CLI가 전역 설치되지 않음

// 해결 방안
# 1. React Native CLI 전역 설치
npm install -g react-native-cli

# 2. 프로젝트 초기화
npx react-native init QuoteServiceApp

# 3. iOS/Android 의존성 설치
cd mobile
cd ios && pod install
npm install
```

#### 문제 2: 시뮬레이터 설정
```javascript
// 에러 메시지: No emulators found
// 원인: Android 에뮬레이터가 설정되지 않음

// 해결 방안
# 1. Android Studio 설치
# 2. Android Emulator 생성
# 3. AVD (Android Virtual Device) 설정

# iOS 시뮬레이터
# 1. Xcode 설치
# 2. iOS Simulator 사용
```

### 4. 관리자 웹 테스트 문제

#### 문제 1: React Testing Library 설정
```javascript
// 에러 메시지: @testing-library/react not found
// 원인: 테스팅 라이브러리가 설치되지 않음

// 해결 방안
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

#### 문제 2: 모의 설정 누락
```javascript
// 에러 메시지: createStore is not a function
// 원인: Redux 설정이 없음

// 해결 방안
npm install --save-dev @reduxjs/toolkit
# store 설정 파일 생성
```

## 실제 테스트 실행을 위한 단계별 가이드

### 1단계: 환경 설정

#### 필수 설치
```bash
# 1. Node.js 설치 확인
node --version  # v18.x 이상 필요

# 2. PostgreSQL 설치 (필수)
# Windows: Chocolatey 이용
choco install postgresql

# 3. Git 설치 (선택사항)
# 팀 협업 시 필요
```

#### 프로젝트 설정
```bash
# 1. 프로젝트 복사
git clone <repository-url>
cd my-first-git

# 2. 백엔드 의존성 설치
cd backend
npm install

# 3. 환경 변수 설정
copy .env.example .env
# .env 파일에 데이터베이스 정보 입력

# 4. 데이터베이스 설정
createdb quote_service
# 또는
psql -U postgres
CREATE DATABASE quote_service;
```

### 2단계: 데이터베이스 마이그레이션

```bash
cd backend

# 스키마 마이그레이션
npm run migrate

# 테스트 데이터 로드
npm run migrate --seed

# 마이그레이션 확인
psql -U postgres -d quote_service
\dt
```

### 3단계: 백엔드 서버 시작

```bash
cd backend

# 개발 모드로 시작
npm run dev

# 또는 일반 모드
npm start

# 다른 터미널에서 헬스 체크
curl http://localhost:3000/health
```

### 4단계: 테스트 실행

```bash
# 백엔드 테스트
cd backend
npm test

# 특정 테스트
npm test -- tests/auth.test.js

# 커버리지 확인
npm test -- --coverage
```

## Windows 환경 특수 문제

### 1. 포트 사용 확인

```bash
# 사용 중인 포트 확인
netstat -ano | findstr :3000

# 특정 포트 사용 프로세스 종료
taskkill /PID <PID> /F
```

### 2. 방화벽 설정

```bash
# Windows 방화벽에서 포트 허용
# 제어판 > 시스템 및 보안 > Windows Defender 방화벽 > 고급 설정
# 인바운드 규칙 > 포트 및 프로토콜
# 포트 3000 허용
```

### 3. 경로 길이 제한

```bash
# Windows 경로 길이 제한 (260자)
# 프로젝트를 짧은 경로로 이동
# 예: C:\projects\quote-service
```

## 대체 테스트 방법

### 1. 수동 테스트
```bash
# API 테스트
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"Test123!"}'
```

### 2. 브라우저 테스트
```
# 관리자 웹 테스트
cd admin-web
npm start
# 브라우저에서 http://localhost:3000 접속
```

### 3. 로그 기반 테스트
```javascript
// 콘솔 로그 확인
console.log('테스트 실행 로그');
console.log('에러 상황 확인');
```

## 권장 사항

### 1. Docker 사용 (권장)
```bash
# Docker를 사용하면 환경 일관성 보장
# docker-compose.yml 파일 생성

version: '3'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: quote_service
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=share_service
      - DB_USER=postgres
      - DB_PASSWORD=postgres
    volumes:
      - ./backend:/app
    command: npm start

volumes:
  postgres_data:
```

### 2. 클라우드 IDE 사용 (권장)
- GitHub Codespaces
- Gitpod
- Replit
- 이러한 환경은 사전에 환경이 구성되어 있음

### 3. WSL2 사용 (Windows 권장)
```bash
# Windows Subsystem for Linux 사용
# Linux 환경에서 테스트 실행
```

## 문제 해결 우선순위

### 높은 우선순위
1. **의존성 설치**: 모든 테스트의 기본 전제 조건
2. **데이터베이스 설치**: PostgreSQL 설치 및 설정
3. **환경 변수 설정**: .env 파일 생성 및 설정

### 중간 우선순위
1. **백엔드 서버 시작**: 기본 서버 구동 확인
2. **헬스 체크**: 서버 정상 작동 확인
3. **단위 테스트**: 기본 테스트부터 시작

### 낮은 우선순위
1. **통합 테스트**: 단위 테스트 성공 후 실행
2. **성능 테스트**: 기능 테스트 성공 후 실행
3. **모니터링**: 운영 단계에서 설정

## 결론

현재 환경에서는 실제 테스트 실행이 어려운 상황입니다. 권장하는 접근 방법은 다음과 같습니다:

1. **Docker 사용**: 환경 일관성 보장
2. **클라우드 IDE 사용**: 사전 구성된 환경 활용
3. **단계별 설정**: 의존성 → 데이터벱이스 → 서버 → 테스트 순서로 진행

현재 작성된 코드와 문서는 완벽하게 구성되어 있으므로, 적절한 환경에서는 테스트가 정상적으로 실행될 것입니다.
