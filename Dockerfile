# ---- Builder Stage ----
FROM node:20-slim AS builder

WORKDIR /usr/src/app

# 의존성 설치
COPY package*.json ./
RUN npm install

# Prisma 클라이언트 생성
COPY prisma ./prisma/
RUN npx prisma generate

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:20-slim AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# 프로덕션 의존성만 설치
COPY package*.json ./
RUN npm install --omit=dev

# 빌더 스테이지에서 빌드된 파일과 Prisma 스키마를 복사
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

# 테스트용
# COPY ./.env.prod ./.env

# Prisma 클라이언트 생성
RUN npx prisma generate

# 포트 4000번을 노출
EXPOSE 4000

# main.js 실행 (docker-compose.yml에서 덮어씀)
# CMD [ "npm", "run", "start" ]
