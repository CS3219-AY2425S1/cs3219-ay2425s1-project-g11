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

# Accept build argument
ARG NEXT_PUBLIC_API_GATEWAY_URL
ARG NEXT_PUBLIC_GITHUB_CLIENT_ID
ARG NEXT_PUBLIC_SOCK_SERVER_URL
ARG NEXT_PUBLIC_AUDIO_SERVER_URL
ARG NEXT_PUBLIC_TURN_SERVER
ARG NEXT_PUBLIC_TURN_USERNAME
ARG NEXT_PUBLIC_TURN_PASSWORD

# Set environment variable
ENV NEXT_PUBLIC_API_GATEWAY_URL=$NEXT_PUBLIC_API_GATEWAY_URL
ENV NEXT_PUBLIC_GITHUB_CLIENT_ID=$NEXT_PUBLIC_GITHUB_CLIENT_ID
ENV NEXT_PUBLIC_SOCK_SERVER_URL=$NEXT_PUBLIC_SOCK_SERVER_URL
ENV NEXT_PUBLIC_AUDIO_SERVER_URL=$NEXT_PUBLIC_AUDIO_SERVER_URL
ENV NEXT_PUBLIC_TURN_SERVER=$NEXT_PUBLIC_TURN_SERVER
ENV NEXT_PUBLIC_TURN_USERNAME=$NEXT_PUBLIC_TURN_USERNAME
ENV NEXT_PUBLIC_TURN_PASSWORD=$NEXT_PUBLIC_TURN_PASSWORD

COPY . .
RUN pnpm build

# Expose the port the app runs on in production mode
EXPOSE ${PORT}

# Start the app in production mode
CMD ["pnpm", "start"]
