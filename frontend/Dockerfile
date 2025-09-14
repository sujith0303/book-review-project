# Dockerfile.frontend
FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all frontend code
COPY . .

# Build frontend
RUN npm run build

# Expose port and run
EXPOSE 3000
CMD ["npm", "start"]
