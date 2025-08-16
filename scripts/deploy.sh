#!/bin/bash

# Production deployment script
echo "Starting deployment..."

# Pull latest changes
git pull origin main

# Build and start containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Check if services are running
docker-compose ps

echo "Deployment complete!"
echo "Application available at: http://localhost:3000"
