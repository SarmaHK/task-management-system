# === Build Stage ===
FROM node:20-alpine AS builder
<<<<<<< HEAD
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# === Production Stage ===
FROM node:20-slim
WORKDIR /app

# CRITICAL ENGINE FIX: Install OpenSSL inside the final Debian environment
RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
RUN npm ci --omit=dev
=======

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --omit=dev
>>>>>>> main

# Copy generated prisma client and build output
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist
<<<<<<< HEAD
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
=======
COPY --from=builder /app/src ./src

# Use unprivileged node user
USER node

# Use unprivileged node user
USER node
>>>>>>> main

EXPOSE 5000
CMD ["npm", "start"]