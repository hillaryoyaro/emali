#!/bin/bash

# Variables
IMAGE_NAME="emaliexpress"
USERNAME="oyaroh"
TAG="latest"

# Build the image
docker build -t $IMAGE_NAME .

# Tag the image for Docker Hub
docker tag $IMAGE_NAME:latest $USERNAME/$IMAGE_NAME:$TAG

# Push the image
docker push $USERNAME/$IMAGE_NAME:$TAG
