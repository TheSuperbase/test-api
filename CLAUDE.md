# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

웹에 흩어져 있는 배드민턴 대회 정보를 한곳에 모아 제공하는 서비스의 Backend API입니다.
기존 대회 정보 사이트들의 복잡한 UI를 개선하여, 사용자가 대회 일정을 쉽고 빠르게 확인할 수 있도록 합니다.

- **데이터 수집**: Python 크롤러로 여러 대회 사이트에서 정보 수집
- **API 제공**: NestJS 기반 REST API (토너먼트 CRUD, JWT 인증, Swagger 문서화)

## Tech Stack

| 분류                 | 기술                                   |
| -------------------- | -------------------------------------- |
| **Backend**          | NestJS 11, TypeScript 5.7, Node.js     |
| **Database**         | Supabase (PostgreSQL), Prisma ORM 6.19 |
| **Authentication**   | Passport, JWT                          |
| **Validation**       | class-validator, class-transformer     |
| **Documentation**    | Swagger (OpenAPI)                      |
| **Testing**          | Jest 30, Supertest                     |
| **Linting**          | ESLint 9, Prettier                     |
| **Package Manager**  | pnpm                                   |
| **Scripts (Python)** | requests, beautifulsoup4, psycopg2     |

## Commands

```bash
# 개발
pnpm start:dev          # 개발 서버 (watch mode)
pnpm build              # 프로덕션 빌드

# 테스트
pnpm test               # 유닛 테스트 실행
pnpm test:watch         # 테스트 watch mode
pnpm test -- --testPathPattern=tournaments  # 특정 모듈 테스트
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

## Architecture

```
src/
├── main.ts                 # 앱 진입점, Swagger 설정 (/api)
├── app.module.ts           # 루트 모듈 (PrismaModule, TournamentsModule, AuthModule)
├── prisma/                 # DB 연결 (PrismaService)
├── tournaments/            # 핵심 비즈니스 로직
│   ├── tournaments.controller.ts  # REST 엔드포인트
│   ├── tournaments.service.ts     # 비즈니스 로직, 응답 변환
│   └── dto/                       # CreateTournamentDto, TournamentResponseDto
└── auth/                   # JWT 인증
    ├── auth.service.ts     # 로그인, 토큰 발급
    └── jwt.strategy.ts     # Passport JWT 전략
```

## Key Patterns

- **인증**: `@UseGuards(JwtAuthGuard)`로 엔드포인트 보호. 환경변수 `ADMIN_ID`, `ADMIN_PASSWORD`, `JWT_SECRET` 사용
- **DTO 변환**: `TournamentsService.toResponseDto()`에서 DB 모델 → API 응답 형식 변환 (날짜 포맷, D-day 계산)
- **Swagger**: `@ApiOperation`, `@ApiResponse` 데코레이터로 문서화. `/api` 경로에서 확인

## Database

Supabase (PostgreSQL) + Prisma ORM. 스키마: `prisma/schema.prisma`

주요 모델: `Tournament` (대회명, 기간, 신청기간, 지역, 장소, 주최 등)

## Python Scripts

`scripts/python/` 폴더에 데이터 수집 및 import 스크립트가 있습니다.

```bash
# 가상환경 활성화
cd scripts/python
source venv/bin/activate

# 크롤링 (2025년 12월 대회 수집)
python tournament-scraper.py --end-id 4200 --year 2025 --month 12

# DB import (미리보기)
python import-csv.py --csv ../../badmintongame_2025_12.csv --dry-run

# DB import (실제 실행)
python import-csv.py --csv ../../badmintongame_2025_12.csv

# 비활성화
deactivate
```

**스크립트 목록:**

- `tournament-scraper.py` - 배드민턴 대회 정보 크롤링 → CSV 저장
- `import-csv.py` - CSV 파일을 DB에 import
