# Base stage for both development and production
FROM node:18-alpine AS base

# Set working directory
WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json ./

# Development stage
FROM base AS development

RUN pnpm install

COPY . .

# Note: Don't expose ports here, Compose will handle that for us

CMD ["pnpm", "dev"]


# Production stage
FROM base AS production
ENV NODE_ENV=production
ENV PORT=3001

# install without dev dependencies
RUN pnpm install --prod

COPY . .

EXPOSE ${PORT}

CMD ["pnpm", "start"]
