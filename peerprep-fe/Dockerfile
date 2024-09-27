# Use an official Node runtime as the base image
FROM node:18-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory in the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package*.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install

# Install zustand explicitly (in case it's still not included)
RUN pnpm add zustand

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN pnpm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
