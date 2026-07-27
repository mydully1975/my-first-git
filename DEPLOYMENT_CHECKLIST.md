# 배포 체크리스트

## 사전 배포 점검

### 1. 코드 리뷰
- [ ] 모든 테스트 통과 확인
- [ ] 보안 취약점 수정 완료
- [ ] 성능 최적화 적용
- [ ] 하드코딩된 값 제거
- [ ] 디버깅 코드 제거

### 2. 환경 설정
- [ ] 프로덕션 환경 변수 설정
- [ ] 데이터베이스 연결 확인
- [ ] SSL/TLS 인증서 설치
- [ ] 도메인 DNS 설정
- [ ] 방화벽 규칙 설정

### 3. 데이터베이스
- [ ] 프로덕션 데이터베이스 생성
- [ ] 스키마 마이그레이션 실행
- [ ] 시드 데이터 로드 (필요한 경우)
- [ ] 백업 시스템 구성
- [ ] 복구 테스트 수행

### 4. 백엔드 서버
- [ ] Node.js 버전 확인
- [ ] 의존성 패키지 설치
- [ ] PM2 프로세스 매니저 설정
- [ ] Nginx 리버스 프록시 설정
- [ ] 로그 로테이션 설정

### 5. 모바일 앱
- [ ] React Native 빌드 설정
- [ ] iOS 앱스토어 준비
- [ ] Android Play Store 준비
- [ ] 앱 서명 및 인증서
- [ ] 푸시 알림 인증서

### 6. 관리자 웹
- [ ] React 빌드 설정
- [ ] 정적 파일 최적화
- [ ] CDN 배포 설정
- [ ] 환경 변수 설정
- [ ] HTTPS 강제 설정

## 배포 스크립트

### 백엔드 배포 스크립트
```bash
#!/bin/bash

# 백엔드 배포 스크립트

echo "백엔드 배포 시작..."

# 1. 의존성 설치
cd backend
npm install --production

# 2. 환경 변수 설정
cp .env.production .env

# 3. 데이터베이스 마이그레이션
npm run migrate

# 4. PM2 재시작
pm2 restart quote-service-api

# 5. 건강 체크
curl -f http://localhost:3000/health || exit 1

echo "백엔드 배포 완료"
```

### 관리자 웹 배포 스크립트
```bash
#!/bin/bash

# 관리자 웹 배포 스크립트

echo "관리자 웹 배포 시작..."

# 1. 의존성 설치
cd admin-web
npm install --production

# 2. 빌드
npm run build

# 3. 정적 파일 배포
# AWS S3 또는 다른 호스팅으로 복사
# aws s3 sync build/ s3://quoteservice-admin-web --delete

# 4. CDN 캐시 무효화
# aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"

echo "관리자 웹 배포 완료"
```

### 모바일 앱 배포 스크립트
```bash
#!/bin/bash

# iOS 배포
cd mobile
npx react-native run-ios --configuration Release

# Android 배포
cd android
./gradlew assembleRelease

# APK/AAB 파일 생성
./gradlew bundleRelease
```

## CI/CD 파이프라인

### GitHub Actions 설정
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Build
      run: npm run build

    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd /var/www/quote-service
          git pull origin main
          npm install --production
          npm run migrate
          pm2 restart quote-service-api
```

## 롤백 계획

### 롤백 절차
1. 이전 버전으로 복원
2. 데이터베이스 롤백 (필요한 경우)
3. 서비스 재시작
4. 건강 체크
5. 롤백 알림

### 롤백 스크립트
```bash
#!/bin/bash

# 롤백 스크립트

echo "롤백 시작..."

# 1. 이전 버전 체크아웃
git checkout previous-version

# 2. 의존성 설치
npm install --production

# 3. 서비스 재시작
pm2 restart quote-service-api

# 4. 건강 체크
curl -f http://localhost:3000/health || exit 1

echo "롤백 완료"
```

## 배포 후 점검

### 1. 기능 점검
- [ ] 모든 API 엔드포인트 작동
- [ ] 사용자 인증 정상 작동
- [ ] 데이터베이스 연결 정상
- [ ] 파일 업로드 작동
- [ ] 알림 시스템 작동

### 2. 성능 점검
- [ ] 응답 시간 측정
- [ ] CPU/메모리 사용량 확인
- [ ] 데이터베이스 쿼리 성능 확인
- [ ] 동시 사용자 처리 확인

### 3. 보안 점검
- [ ] HTTPS 정상 작동
- [ ] 보안 헤더 설정 확인
- [ ] CORS 설정 확인
- [ ] 인증 시스템 작동

### 4. 모니터링
- [ ] 로그 수집 확인
- [ ] 에러 알림 작동
- [ ] 성능 모니터링 작동
- [ ] 백업 시스템 작동
