FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install -g pnpm && \
    if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; else pnpm install; fi

FROM node:20-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["node", "-e", "console.log('Database service initialized')"]
