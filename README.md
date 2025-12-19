# Badminton Tournament API

웹에 흩어져 있는 배드민턴 대회 정보를 한곳에 모아 제공하는 서비스의 Backend API입니다.

기존 대회 정보 사이트들의 복잡한 UI를 개선하여, 사용자가 대회 일정을 쉽고 빠르게 확인할 수 있도록 합니다.

## Features

- **데이터 수집**: Python 크롤러로 여러 대회 사이트에서 정보 수집
- **REST API**: 토너먼트 CRUD, 커서 기반 페이지네이션
- **인증**: JWT 기반 관리자 인증
- **문서화**: Swagger (OpenAPI) 자동 문서화

## Tech Stack

| 분류                | 기술                                   |
| ------------------- | -------------------------------------- |
| **Backend**         | NestJS 11, TypeScript 5.7, Node.js     |
| **Database**        | Supabase (PostgreSQL), Prisma ORM 6.19 |
| **Authentication**  | Passport, JWT                          |
| **Validation**      | class-validator, class-transformer     |
| **Documentation**   | Swagger (OpenAPI)                      |
| **Testing**         | Jest 30, Supertest                     |
| **Linting**         | ESLint 9, Prettier                     |
| **Package Manager** | pnpm                                   |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase 계정 (또는 로컬 PostgreSQL)

### Installation

```bash
# 의존성 설치
pnpm install

# 환경변수 설정
cp .env.example .env
# .env 파일에 DATABASE_URL, JWT_SECRET 등 설정

# Prisma Client 생성
pnpm prisma generate

# 개발 서버 실행
pnpm start:dev
```

### Environment Variables

```env
DATABASE_URL=postgresql://...
ADMIN_ID=your_admin_id
ADMIN_PASSWORD=your_admin_password
JWT_SECRET=your_jwt_secret
```

## Scripts

```bash
# 개발
pnpm start:dev          # 개발 서버 (watch mode)
pnpm build              # 프로덕션 빌드

# 테스트
pnpm test               # 유닛 테스트
pnpm test:e2e           # E2E 테스트
pnpm test:cov           # 커버리지 리포트

# 린트/포맷
pnpm lint               # ESLint (auto-fix)
pnpm format             # Prettier

# 데이터베이스
pnpm prisma generate    # Prisma Client 생성
pnpm prisma migrate dev # 마이그레이션 실행
pnpm prisma studio      # DB GUI
```

## API Documentation

개발 서버 실행 후 `/api` 경로에서 Swagger 문서를 확인할 수 있습니다.

```
http://localhost:3000/api
```

## Project Structure

```
src/
├── main.ts                 # 앱 진입점, Swagger 설정
├── app.module.ts           # 루트 모듈
├── prisma/                 # DB 연결 (PrismaService)
├── tournaments/            # 대회 정보 모듈
│   ├── tournaments.controller.ts
│   ├── tournaments.service.ts
│   └── dto/
└── auth/                   # JWT 인증 모듈
    ├── auth.service.ts
    └── jwt.strategy.ts

scripts/
└── python/                 # 데이터 수집 스크립트
    ├── tournament-scraper.py
    └── import-csv.py
```

## License

MIT
