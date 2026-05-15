# Stage 1: Base
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Stage 2: Dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Stage 3: Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 4: Production Runtime
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PATH /app/node_modules/.bin:$PATH

# Copy built files and all dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules

# Copy files needed for migrations
COPY --from=builder /app/src ./src

EXPOSE 3000

CMD ["node", "dist/main.js"]
