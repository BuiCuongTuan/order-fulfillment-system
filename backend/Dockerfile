# Stage 1: Build
FROM node:22-alpine AS builder

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the NestJS app
RUN npm run build

# Stage 2: Production
FROM node:22-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

# Copy generated Prisma client structure and strictly necessary files
COPY --from=builder /usr/src/app/prisma ./prisma
RUN npx prisma generate

COPY --from=builder /usr/src/app/dist ./dist

# Keep the same internal port as Nest default
EXPOSE 3000

CMD ["npm", "run", "start:prod"]
