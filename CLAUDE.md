# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

배드민턴 토너먼트 정보 관리 REST API. NestJS 기반으로 토너먼트 CRUD, JWT 인증, Swagger 문서화를 제공합니다.

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

PostgreSQL + Prisma ORM. 스키마: `prisma/schema.prisma`

주요 모델: `Tournament` (대회명, 기간, 신청기간, 지역, 장소, 주최 등)
