# Base stage for both dev and prod
FROM node:18-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm nodemon

# Set the working directory in the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json ./

RUN pnpm install

# Development stage
FROM base AS development

COPY pnpm-lock.yaml ./
COPY src ./src
COPY tsconfig.json ./

# Note: Don't expose ports here, Compose will handle that for us

CMD ["pnpm", "dev"]


# Production stage
FROM base AS production
ENV NODE_ENV=production
ENV PORT=4001

COPY pnpm-lock.yaml ./
COPY src ./src
COPY tsconfig.json ./

EXPOSE ${PORT}

CMD ["pnpm", "start"]
