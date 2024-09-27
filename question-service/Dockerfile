FROM node:18-alpine

RUN npm install -g pnpm

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any dependencies
RUN pnpm install

# Bundle app source inside the Docker image
COPY src ./src

COPY tsconfig.json ./tsconfig.json

RUN pnpm run build

# Make port 4001 available to the world outside this container
ENV PORT=4001

EXPOSE ${PORT}

# Define the command to run your app
CMD ["pnpm", "start"]