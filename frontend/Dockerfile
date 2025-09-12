# Use Node.js Alpine image
FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json first to install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build the Next.js app
RUN npm run build

# Start the app
CMD ["npm", "start"]
