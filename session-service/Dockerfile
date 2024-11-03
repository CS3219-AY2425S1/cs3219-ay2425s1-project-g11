# Base stage for both dev and prod
FROM node:18-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm nodemon

# Set the working directory in the container
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Development stage
FROM base AS development

# Install ALL dependencies (both prod and dev)
RUN pnpm install

# Copy source files
COPY . .

CMD ["pnpm", "dev"]


# Production stage
FROM base AS production
ENV NODE_ENV=production
ENV PORT=4444

COPY src ./src
COPY tsconfig.json ./

EXPOSE ${PORT}

CMD ["pnpm", "start"]
