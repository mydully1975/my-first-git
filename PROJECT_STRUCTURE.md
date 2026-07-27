# 프로젝트 구조

## 디렉토리 구조

```
my-first-git/
├── backend/                    # Node.js + Express 백엔드
│   ├── src/
│   │   ├── config/            # 설정 파일
│   │   ├── controllers/      # 컨트롤러
│   │   ├── models/           # 데이터베이스 모델
│   │   ├── routes/           # API 라우트
│   │   ├── middleware/       # 미들웨어
│   │   ├── services/         # 비즈니스 로직
│   │   ├── utils/            # 유틸리티
│   │   └── app.js            # Express 앱 설정
│   ├── package.json
│   └── .env.example
│
├── mobile/                    # React Native 앱
│   ├── src/
│   │   ├── components/       # 재사용 컴포넌트
│   │   ├── screens/          # 화면
│   │   ├── navigation/       # 네비게이션
│   │   ├── services/         # API 서비스
│   │   ├── store/            # 상태 관리
│   │   ├── utils/            # 유틸리티
│   │   └── App.js            # 메인 앱
│   ├── package.json
│   └── app.json
│
├── admin-web/                 # 관리자 웹 (React)
│   ├── src/
│   │   ├── components/       # 재사용 컴포넌트
│   │   ├── pages/            # 페이지
│   │   ├── services/         # API 서비스
│   │   ├── store/            # 상태 관리
│   │   └── App.js            # 메인 앱
│   ├── package.json
│   └── public/
│
├── database/                  # 데이터베이스
│   ├── migrations/           # 마이그레이션 파일
│   ├── seeds/                # 시드 데이터
│   └── schema.sql            # 초기 스키마
│
├── DESIGN.md                  # 기본 설계 문서
├── PROJECT_STRUCTURE.md       # 프로젝트 구조
└── README.md                  # 프로젝트 설명
```