FROM node:20-alpine AS base

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

FROM base AS deps

ARG DIRECT_URL
ENV DIRECT_URL=${DIRECT_URL}

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

FROM base AS runner

ENV NODE_ENV=development

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/generated ./generated
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/prisma ./prisma
COPY --from=deps /app/prisma.config.ts ./

COPY jest.config.js ./
COPY serverless.yml ./
COPY src ./src
COPY tests ./tests

EXPOSE 3000

CMD ["npx", "serverless", "offline", "--host", "0.0.0.0"]