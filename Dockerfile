FROM node:20-slim

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of your application code
COPY . .

# Build the Next.js application
RUN pnpm run build

# Expose the port Next.js runs on
EXPOSE 3000

# Define the command to start your application
CMD ["pnpm", "start"]
