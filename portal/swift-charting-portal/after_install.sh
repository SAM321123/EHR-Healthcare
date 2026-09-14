#!/bin/bash
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 501401424863.dkr.ecr.ap-south-1.amazonaws.com
# docker-compose -f frontend-compose.yml -f backend-compose.yml up -d
#docker-compose -f frontend-compose.yml up -d
if [ -f backend-compose.yml ]; then
  docker-compose -f frontend-compose.yml -f backend-compose.yml up -d
else
  docker-compose -f frontend-compose.yml up -d
fi
docker system prune -a -f