# 1. Node 이미지 선택 (pnpm 쓰니까 node 20 + alpine)
FROM node:20-alpine

# 2. 앱 폴더
WORKDIR /app

# 3. pnpm 설치 & 패키지 설치
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm \
  && pnpm install --frozen-lockfile

# 4. 소스 복사
COPY . .


# 5. Prisma Client 생성
ENV DATABASE_URL="postgresql://postgres.fdcjkhmirnoqzflvriso:Vlrhsgkek@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"
ENV DIRECT_URL="postgresql://postgres.fdcjkhmirnoqzflvriso:Vlrhsgkek@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"
ENV ADMIN_ID=admin
ENV ADMIN_PASSWORD=super-strong-password
ENV JWT_SECRET=very-secret-jwt-key
ENV JWT_EXPIRES_IN=86400

# 6. Prisma Client 생성
RUN pnpm prisma generate

# 7. 빌드
RUN pnpm build

# 8. 컨테이너 실행 커맨드
CMD ["pnpm", "start:prod"]

# 9. 컨테이너가 노출하는 포트 (Nest 포트)
EXPOSE 3000



