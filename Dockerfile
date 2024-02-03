# Stage 1: Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy only package.json and package-lock.json to leverage Docker's layer caching
COPY package*.json ./

# Install dependencies, including dev dependencies
RUN npm install

# Copy the entire application code
COPY . .

RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine as production

WORKDIR /app

# Copy only necessary files from the build stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist/ ./dist/

EXPOSE 3000

# Command to run your application
CMD [ "npm", "run", "prod" ]
