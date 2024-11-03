FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies with exact versions
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
ENV NODE_ENV=development

# Copy the rest of the application code
COPY . .

# Install Next.js explicitly and verify installation
RUN pnpm add next@14.2.12 react@18 react-dom@18
RUN pnpm install
RUN ls -la node_modules/.bin/next

# Start the app in dev mode
CMD ["pnpm", "run", "dev"]

# Production stage
FROM base AS production
ENV NODE_ENV=production
ENV PORT=3000

ARG NEXT_PUBLIC_API_GATEWAY_URL
ENV NEXT_PUBLIC_API_GATEWAY_URL=$NEXT_PUBLIC_API_GATEWAY_URL

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build

EXPOSE ${PORT}

CMD ["pnpm", "start"]
