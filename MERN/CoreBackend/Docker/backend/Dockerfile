# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Install dependencies separately for better layer caching
FROM base AS deps
COPY package.json package-lock.json* ./
# Avoid running postinstall here; prisma schema isn't copied yet
RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts

# Generate Prisma client
FROM deps AS prisma
COPY prisma ./prisma
RUN npx prisma generate

# Build the app
FROM deps AS build
ENV NODE_ENV=development
COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./package.json
COPY prisma ./prisma
# Generate Prisma client now that schema is present
RUN npx prisma generate && npm prune --omit=dev
ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/server.js"]

# remember this