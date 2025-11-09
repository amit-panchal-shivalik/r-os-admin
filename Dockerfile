# R-OS Admin Dashboard - Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Build Stage
FROM node:20.18.1-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# # Stage 2: Production Stage
# FROM nginx:alpine

# # Copy built files from builder
# COPY --from=builder /app/build /usr/share/nginx/html

# # Copy nginx config
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Expose port
# EXPOSE 80

# Start nginx
CMD ["npm", "run", "preview"]
