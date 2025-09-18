# inherit from a existing image to add the functionality
FROM node:20-alpine

# set a key-value label for the Docker image (maintainer)
LABEL maintainer="Hillary Oyaro"

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into the image.
COPY package*.json ./


# Install the dependencies.
RUN npm install

# Copy the rest of the source files into the image.
COPY . .

# Build the application.Compile and optimize the app for production
#Since we are using typescript and is for development for production we turn it into javascript code
RUN npm run build

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD npm run dev