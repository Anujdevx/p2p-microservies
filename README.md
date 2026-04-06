# P2P Microservices Architecture

A distributed microservices system with peer-to-peer file transfer capabilities.

## Architecture Overview

This project contains a complete microservices architecture with:

- **Service Registry (Eureka)**: Service discovery
- **API Gateway**: Single entry point for all services
- **Config Server**: Centralized configuration management
- **User Service**: Sample business service
- **Product Service**: Sample business service
- **File Transfer Service**: P2P file transfer with WebSocket support

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- Docker (optional, for containerization)

## Getting Started

### Build All Services
```bash
mvn clean install
```

### Run Services (in order)

1. Config Server (port 8888)
```bash
cd config-server
mvn spring-boot:run
```

2. Service Registry (port 8761)
```bash
cd service-registry
mvn spring-boot:run
```

3. API Gateway (port 8080)
```bash
cd api-gateway
mvn spring-boot:run
```

4. User Service (port 8081)
```bash
cd user-service
mvn spring-boot:run
```

5. Product Service (port 8082)
```bash
cd product-service
mvn spring-boot:run
```

6. File Transfer Service (port 8083)
```bash
cd file-transfer-service
mvn spring-boot:run
```

## Service URLs

- Eureka Dashboard: http://localhost:8761
- API Gateway: http://localhost:8080
- Config Server: http://localhost:8888
- User Service: http://localhost:8081
- Product Service: http://localhost:8082
- File Transfer Service: http://localhost:8083
- File Transfer Test Client: file-transfer-service/test-client.html

## Key Technologies

- Spring Boot 3.2.4
- Spring Cloud 2023.0.1
- Netflix Eureka
- Spring Cloud Gateway
- Spring Cloud Config
- Spring Data JPA
- Spring WebSocket (STOMP)
- H2 Database (for demo)

## Testing the File Transfer Service

Open `file-transfer-service/test-client.html` in multiple browser windows to test P2P file transfer:

1. Register each window as a different peer
2. Select a file and target peer
3. Send the file and watch real-time progress
4. Accept/reject incoming transfers

See `file-transfer-service/README.md` for detailed API documentation.
