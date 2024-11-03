# Base stage for both development and production
FROM node:18-alpine AS base

# Set working directory
WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm nodemon

# Copy package.json and pnpm-lock.yaml
COPY package.json ./

RUN pnpm install

# Development stage
FROM base AS development

COPY . .

# Note: Don't expose ports here, Compose will handle that for us

CMD ["pnpm", "dev"]


# Production stage
FROM base AS production
ENV NODE_ENV=production
ENV PORT=3001

COPY . .

EXPOSE ${PORT}

CMD ["pnpm", "start"]
