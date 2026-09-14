#!/bin/bash

# Stop and delete all previous running containers
echo "Stopping and deleting previous containers..."

aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 501401424863.dkr.ecr.ap-south-1.amazonaws.com
# Stop running containers
docker-compose -f frontend-compose.yml -f backend-compose.yml down
#docker-compose -f backend-compose.yml down

# Delete containers and volumes
docker-compose -f frontend-compose.yml -f backend-compose.yml rm -f -v
#docker-compose -f backend-compose.yml rm -f -v


echo "Previous containers stopped and deleted."
