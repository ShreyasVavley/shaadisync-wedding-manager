# Stage 1: Build Frontend Assets
FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production Server
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled frontend and backend source
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/src/types ./src/types
COPY tsconfig.json ./

# Ensure database directory exists with persistent volume
RUN mkdir -p /app/server/data
VOLUME ["/app/server/data"]

EXPOSE 3000

CMD ["npx", "tsx", "server/server.ts"]
