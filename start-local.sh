#!/bin/bash

echo "🚀 Starting all microservices locally in the background..."

# Stop any existing ones first
./stop-local.sh

mkdir -p logs

echo "Starting Config Server (8888)..."
(cd config-server && ../mvnw spring-boot:run > ../logs/config-server.log 2>&1) &
CONFIG_PID=$!
sleep 5 # wait a bit for config server to start

echo "Starting Service Registry (8761)..."
(cd service-registry && ../mvnw spring-boot:run > ../logs/service-registry.log 2>&1) &
REGISTRY_PID=$!
sleep 8 # wait for eureka to initialize

echo "Starting API Gateway (8080)..."
(cd api-gateway && ../mvnw spring-boot:run > ../logs/api-gateway.log 2>&1) &
GATEWAY_PID=$!

echo "Starting User Service (8081)..."
(cd user-service && ../mvnw spring-boot:run > ../logs/user-service.log 2>&1) &
USER_PID=$!

echo "Starting Product Service (8082)..."
(cd product-service && ../mvnw spring-boot:run > ../logs/product-service.log 2>&1) &
PRODUCT_PID=$!

echo "Starting File Transfer Service (8083)..."
(cd file-transfer-service && ../mvnw spring-boot:run > ../logs/file-transfer-service.log 2>&1) &
FILE_PID=$!

echo "Starting Auth Service (8084)..."
(cd auth-service && ../mvnw spring-boot:run > ../logs/auth-service.log 2>&1) &
AUTH_PID=$!

echo "Starting Peer Management Service (8085)..."
(cd peer-management-service && ../mvnw spring-boot:run > ../logs/peer-management-service.log 2>&1) &
PEER_PID=$!

echo "✅ All services started in the background!"
echo "PIDs: Config($CONFIG_PID) Registry($REGISTRY_PID) Gateway($GATEWAY_PID) User($USER_PID) Product($PRODUCT_PID) FileTransfer($FILE_PID) Auth($AUTH_PID) Peer($PEER_PID)"
echo "You can view logs in the 'logs/' directory."
echo "To stop everything, run: ./stop-local.sh"
