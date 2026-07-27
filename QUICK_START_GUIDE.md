# 현재 컴퓨터에서 웹 브라우저에 띄우기 위한 단계별 가이드

## 현재 상황 분석
- **운영체제**: Windows
- **Node.js 버전**: v24.18.0 (최신 버전)
- **npm 버전**: 11.16.0 (최신 버전)
- **주요 문제**: npm 의존성 설치 실패, PostgreSQL 미설치

## 단계별 실행 가이드

### 1단계: 필수 소프트웨어 설치

#### Node.js 재설치 (안정 버전 권장)
```bash
# 현재 Node.js v24.18.0는 너무 최신 버전으로 호환성 문제 가능
# 안정적인 버전인 v18.x 또는 v20.x 설치 권장

# 1. 기존 Node.js 제거
# 제어판 > 프로그램 및 기능 > Node.js 제거

# 2. LTS 버전 다운로드
# https://nodejs.org/
# v18.20.0 LTS 또는 v20.11.0 LTS 다운로드

# 3. 설치 후 버전 확인
node --version  # v18.20.0 또는 v20.11.0 확인
npm --version
```

#### PostgreSQL 설치
```bash
# Windows용 PostgreSQL 설치

# 방법 1: Chocolatey 사용 (권장)
choco install postgresql

# 방법 2: 공식 설치파일
# https://www.postgresql.org/download/windows/
# PostgreSQL 15.x 다운로드 및 설치

# 방법 3: Docker Desktop 사용 (가장 쉬움)
# 1. Docker Desktop 설치
# 2. 다음 명령어로 PostgreSQL 실행
docker run --name postgres-quote-service -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=quote_service -p 5432:5432 -d postgres:15
```

### 2단계: 프로젝트 설정

#### 백엔드 설정
```bash
cd "D:\0_개인\윈드셔프_테스트\my-first-git\backend"

# 의존성 설치 (안정된 Node.js 버전에서)
npm install

# 환경 변수 설정 (.env 파일)
# 이미 생성되어 있음: backend/.env

# 데이터베이스 마이그레이션
# PostgreSQL이 설치된 후 실행
npm run migrate
```

#### 관리자 웹 설정
```bash
cd "D:\0_개인\윈드셔프_테스트\my-first-git\admin-web"

# 의존성 설치
npm install

# 환경 변수 설정 (.env 파일 생성)
echo "REACT_APP_API_URL=http://localhost:3000" > .env
echo "REACT_APP_SOCKET_URL=http://localhost:3001" >> .env
```

### 3단계: 데이터베이스 설정

#### PostgreSQL 데이터베이스 생성
```bash
# PostgreSQL 설치 후

# 1. PostgreSQL 서버 시작
# Windows Services에서 postgresql-x64-15 서비스 시작

# 2. 데이터베이스 생성
psql -U postgres
CREATE DATABASE quote_service;
\q

# 3. 백엔드에서 마이그레이션 실행
cd backend
npm run migrate
```

#### Docker 사용시 (권장)
```bash
# Docker가 설치된 경우
docker run --name postgres-quote-service -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=quote_service -p 5432:5432 -d postgres:15

# 데이터베이스 연결 확인
docker ps
```

### 4단계: 백엔드 서버 시작

```bash
cd "D:\0_개인\윈드셔프_테스트\my-first-git\backend"

# 개발 모드로 시작
npm run dev

# 또는 일반 모드
npm start

# 다른 터미널에서 헬스 체크
curl http://localhost:3000/health
```

### 5단계: 관리자 웹 시작

```bash
cd "D:\0_개인\윈드셔프_테스트\my-first-git\admin-web"

# React 앱 시작
npm start

# 브라우저에서 자동으로 열림
# http://localhost:3000
```

## 현재 환경에서 즉시 테스트하는 방법

### 대안 1: 가상 머신 또는 WSL2 사용
```bash
# Windows Subsystem for Linux 2 설치
# 1. PowerShell 관리자 권한으로 실행
wsl --install

# 2. Ubuntu 설치 후
# 3. Ubuntu 환경에서 Node.js와 PostgreSQL 설치
# 4. 프로젝트 복사 및 실행
```

### 대안 2: 클라우드 IDE 사용
```bash
# GitHub Codespaces, Gitpod, Replit 등 사용
# 1. GitHub에 프로젝트 업로드
# 2. Codespaces 생성
# 3. 사전 구성된 환경에서 실행
```

### 대안 3: Docker Compose 사용 (가장 권장)
```bash
# docker-compose.yml 파일 생성
# 프로젝트 루트에 다음 내용으로 파일 생성

version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: quote-service-postgres
    environment:
      POSTGRES_DB: quote_service
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    container_name: quote-service-backend
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=quote_service
      - DB_USER=postgres
      - DB_PASSWORD=postgres
      - PORT=3000
      - JWT_SECRET=test_secret_key
      - NODE_ENV=development
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm start

  admin-web:
    build: ./admin-web
    container_name: quote-service-admin
    ports:
      - "3001:3000"
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://localhost:3000
    volumes:
      - ./admin-web:/app
      - /app/node_modules
    command: npm start

volumes:
  postgres_data:
```

## 현재 컴퓨터에서 최소한의 테스트 방법

### 1. 정적 파일 서버로 실행
```bash
# 이미 빌드된 파일이 있는 경우
cd admin-web
npm run build

# 간단한 HTTP 서버 설치
npm install -g serve

# 빌드된 파일 서빙
cd build
serve -s . -p 3000

# 브라우저에서 http://localhost:3000 접속
```

### 2. 코드 구조 검증
```bash
# 프로젝트 구조 확인
cd "D:\0_개인\윈드셔프_테스트\my-first-git"

# 파일 구조 확인
dir /s /b

# 주요 파일 확인
notepad admin-web/src/App.js
notepad backend/src/app.js
```

## 권장 실행 순서

### 최단 경로 (경험 많은 개발자)
1. **Docker Desktop 설치**
2. **docker-compose.yml 파일 생성**
3. **docker-compose up 실행**
4. **브라우저에서 http://localhost:3001 접속**

### 표준 경로 (일반 개발자)
1. **Node.js LTS 버전 재설치**
2. **PostgreSQL 설치**
3. **백엔드 의존성 설치 및 설정**
4. **관리자 웹 의존성 설치**
5. **백엔드 서버 시작**
6. **관리자 웹 시작**
7. **브라우저에서 접속**

### 안전 경로 (초보자)
1. **WSL2 설치**
2. **Ubuntu 환경 설정**
3. **Docker 설치**
4. **docker-compose 사용**
5. **브라우저에서 접속**

## 현재 상태에서 확인 가능한 것

### 1. 프로젝트 구조
```bash
# 현재 작성된 코드 확인
dir "D:\0_개인\윈드셔프_테스트\my-first-git"
```

### 2. 문서화 검증
```bash
# 작성된 문서 확인
notepad PROJECT_OVERVIEW.md
notepad FINAL_REPORT.md
notepad TEST_PLAN.md
```

### 3. 코드 품질 검증
```bash
# 각 컴포넌트의 코드 품질 확인
notepad admin-web/src/pages/Dashboard.js
notepad backend/src/controllers/authController.js
```

## 결론

현재 컴퓨터 환경에서는 다음 사항으로 인해 직접 브라우저에 띄우는 것이 어렵습니다:
1. Node.js 최신 버전(v24.18.0) 호환성 문제
2. npm 의존성 설치 실패
3. PostgreSQL 미설치

**가장 권장하는 방법**은 Docker를 사용하는 것입니다. Docker Desktop을 설치하고 제공된 docker-compose.yml 파일을 사용하면 환경 설정 없이 일관된 테스트 환경을 구축할 수 있습니다.

또는 GitHub Codespaces와 같은 클라우드 IDE를 사용하면 사전 구성된 환경에서 즉시 프로젝트를 실행할 수 있습니다.
