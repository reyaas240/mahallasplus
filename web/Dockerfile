# Use Node.js 20 LTS
FROM node:20-slim AS base

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# Build the app
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:20-slim AS runner
RUN apt-get update && apt-get install -y openssl
WORKDIR /app

COPY --from=base /app/next.config.ts ./
COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
