#!/bin/bash

echo "🛑 Stopping all locally running microservices (including auth and peer services)..."

pkill -f "spring-boot:run"

echo "✅ Services (Config, Registry, Gateway, Auth, Peer, User, Product, FileTransfer) stopped gracefully."
