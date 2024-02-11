# Adjust NODE_VERSION as desired
ARG NODE_VERSION=18.16.1
FROM node:18-alpine  as base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Throw-away build stage to reduce size of final image
FROM base as build

# Copy package files
COPY --link package.json package-lock.json ./

# Install node modules
RUN npm ci

# Copy application code
COPY --link . .

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Start the server by default
EXPOSE 3000
CMD [ "npm", "run", "prod" ]

# FROM node:18-alpine as production

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . .

# # Build TS
# RUN npm run build
# EXPOSE 3000

# CMD [ "npm", "run", "prod" ]