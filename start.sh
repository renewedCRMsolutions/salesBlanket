#!/bin/bash

# SalesBlanket v4 Quick Start Script

echo "SalesBlanket v4 Quick Start"
echo "--------------------------"

# Function to check if a command exists
command_exists() {
  command -v "$1" &> /dev/null
}

# Check Node.js is installed
if ! command_exists node; then
  echo "Error: Node.js is not installed. Please install Node.js."
  exit 1
fi

# Check npm is installed
if ! command_exists npm; then
  echo "Error: npm is not installed. Please install npm."
  exit 1
fi

# Check if server node_modules exists
if [ ! -d "server/node_modules" ]; then
  echo "Installing server dependencies..."
  cd server && npm install && cd ..
fi

# Check if client node_modules exists
if [ ! -d "client/node_modules" ]; then
  echo "Installing client dependencies..."
  cd client && npm install && cd ..
fi

# Start the server
echo "Starting SalesBlanket v4 server..."
cd server && npm run dev