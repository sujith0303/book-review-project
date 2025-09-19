# Use an official Node.js runtime as a parent image
FROM node:20-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml (or yarn.lock)
COPY package.json pnpm-lock.yaml ./

# Install project dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN pnpm run build

# --- Production Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm globally for the runner stage as well
RUN npm install -g pnpm

# Copy necessary files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Set environment variables if needed (e.g., for Next.js)
ENV NODE_ENV production
# Set the correct APP_URL based on your docker-compose network
# If your frontend is accessible on http://localhost:3000 from other services, use that.
# Otherwise, use the service name within the Docker network if that's how services communicate.
# For this example, we assume it might be accessed by other services on a network port.
# You might need to adjust this based on your specific network setup.
ENV APP_URL http://frontend:3000

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["pnpm", "start"]