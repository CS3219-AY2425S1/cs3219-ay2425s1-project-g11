# Base stage for both dev and prod
FROM node:18-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm
RUN npm install -g typescript

# Set the working directory in the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json ./

RUN pnpm install

# Development stage
FROM base AS development

COPY src ./src
COPY tsconfig.json ./

# Note: Don't expose ports here, Compose will handle that for us

CMD ["pnpm", "dev"]

# Production stage
FROM base AS production
ENV NODE_ENV=production
ENV PORT=8001

COPY src ./src
COPY tsconfig.json ./

EXPOSE ${PORT}

RUN pnpm build

CMD ["pnpm", "start"]
