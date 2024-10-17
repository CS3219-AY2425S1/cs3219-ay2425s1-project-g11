FROM node:18-alpine AS base

RUN npm install -g pnpm

WORKDIR /app

# Copy package.json
COPY package*.json ./

RUN pnpm install

# Install zustand explicitly
RUN pnpm add zustand

# Development stage
FROM base AS development
ENV NODE_ENV=development

# Copy the rest of the application code
COPY . .

# Note: Don't expose ports here, Compose will handle that for us

# Start the app in dev mode with hot-reloading
CMD ["pnpm", "dev"]


# Production stage
FROM base AS production
ENV NODE_ENV=production
ENV PORT=3000

# Accept build arguments
ARG NEXT_PUBLIC_QUESTION_SERVICE_URL
ARG NEXT_PUBLIC_AUTH_SERVICE_URL
ARG AUTH_SERVICE_URL
ARG QUESTION_SERVICE_URL

# Set environment variables
ENV NEXT_PUBLIC_QUESTION_SERVICE_URL=$NEXT_PUBLIC_QUESTION_SERVICE_URL
ENV NEXT_PUBLIC_AUTH_SERVICE_URL=$NEXT_PUBLIC_AUTH_SERVICE_URL
ENV AUTH_SERVICE_URL=$AUTH_SERVICE_URL
ENV QUESTION_SERVICE_URL=$QUESTION_SERVICE_URL

COPY . .
RUN pnpm build

# Expose the port the app runs on in production mode
EXPOSE ${PORT}

# Start the app in production mode
CMD ["pnpm", "start"]
