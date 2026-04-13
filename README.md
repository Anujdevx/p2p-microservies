# P2P Microservices Architecture

A distributed microservices system with peer-to-peer file transfer capabilities, secure authentication, peer management, and file metadata tracking.

## Architecture Overview

This project contains a complete microservices architecture with:

### Infrastructure Services
- **Service Registry (Eureka)**: Service discovery and registration
- **API Gateway**: Single entry point with routing and authentication filtering

### Core Business Services
- **Auth Service**: JWT-based authentication and user credential management
- **Peer Management Service**: Contact management, group creation, and network topology
- **File Transfer Service**: WebRTC P2P file transfer with WebSocket signaling
- **File Metadata Service**: File metadata tracking, ownership, and status management

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- Node.js 18+ and npm (for frontend)
- Docker & Docker Compose (optional, for containerization)

## Getting Started

### Option 1: Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Stop all services
docker-compose down
```

### Option 2: Manual Build and Run

#### Build All Services
```bash
mvn clean install
```

#### Run Services (in order)

1. Service Registry (port 8761)
```bash
cd service-registry
mvn spring-boot:run
```

2. API Gateway (port 8080)
```bash
cd api-gateway
mvn spring-boot:run
```

3. Auth Service (port 8085)
```bash
cd auth-service
mvn spring-boot:run
```

4. Peer Management Service (port 8086)
```bash
cd peer-management-service
mvn spring-boot:run
```

5. File Transfer Service (port 8083)
```bash
cd file-transfer-service
mvn spring-boot:run
```

6. File Metadata Service (port 8084)
```bash
cd file-metadata-service
mvn spring-boot:run
```

#### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at http://localhost:3000

## Service URLs

### Backend Services
- **Eureka Dashboard**: http://localhost:8761
- **API Gateway**: http://localhost:8080
- **Auth Service**: http://localhost:8085
- **Peer Management Service**: http://localhost:8086
- **File Transfer Service**: http://localhost:8083
- **File Metadata Service**: http://localhost:8084

### Frontend
- **Peerlink Dashboard**: http://localhost:3000
- **Landing Page**: http://localhost:3000
- **Control Center**: http://localhost:3000/dashboard

## API Endpoints

### Auth Service (via Gateway: /auth/*)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `POST /auth/validate` - Validate JWT token

### Peer Management Service (via Gateway: /peers/*, /network/*)
- `GET /peers/active` - Get all active peers
- `POST /peers/register` - Register a peer
- `DELETE /peers/{peerId}/deregister` - Deregister a peer
- `POST /network/contacts/{username}` - Add contact
- `GET /network/active` - Get active contact peers
- `POST /network/groups` - Create peer group
- `GET /network/groups/mine` - Get user's groups
- `GET /network/groups/{groupId}/active` - Get active peers in group

### File Transfer Service (via Gateway: /api/transfers/*)
- `POST /api/transfers/initiate` - Initiate file transfer
- `POST /api/transfers/upload-chunk` - Upload file chunk
- `GET /api/transfers/download/{fileId}` - Download file
- `POST /api/transfers/{fileId}/accept` - Accept transfer
- `POST /api/transfers/{fileId}/reject` - Reject transfer
- `GET /api/transfers/sender/{peerId}` - Get transfers by sender
- `GET /api/transfers/receiver/{peerId}` - Get transfers by receiver

### File Metadata Service (via Gateway: /api/file-metadata/*)
- `POST /api/file-metadata` - Create file metadata
- `GET /api/file-metadata/{fileId}` - Get metadata by file ID
- `GET /api/file-metadata/owner/{ownerId}` - Get metadata by owner
- `GET /api/file-metadata` - Get all metadata
- `PUT /api/file-metadata/{fileId}` - Update metadata
- `DELETE /api/file-metadata/{fileId}` - Delete metadata

## Key Technologies

### Backend
- Spring Boot 3.2.4
- Spring Cloud 2023.0.1
- Netflix Eureka (Service Discovery)
- Spring Cloud Gateway (API Gateway)
- Spring Data JPA (Data Persistence)
- Spring WebSocket & STOMP (Real-time Communication)
- JWT (Authentication)
- H2 Database (In-memory for demo)
- Lombok (Boilerplate Reduction)

### Frontend
- Next.js 15 (React Framework)
- TypeScript (Type Safety)
- Tailwind CSS (Styling)
- shadcn/ui (UI Components)
- Axios (HTTP Client)
- WebRTC (P2P File Transfer)
- Lucide Icons (Icon Library)

## Frontend Features

The **Peerlink Control Center** provides a modern, responsive dashboard with:

### Landing Page
- Modern brutalist design with dark mode support
- Feature showcase for P2P file transfers
- Quick access to dashboard

### Dashboard (Tabbed Interface)

#### File Transfer Tab
- **Authentication**: Secure login/register with JWT
- **Network Manager**: 
  - Add contacts by username
  - Create peer groups for mesh broadcasting
  - View active contacts and groups
- **File Sharing**:
  - WebRTC-based P2P file transfer
  - Direct peer-to-peer or group broadcasting
  - Real-time transfer progress
  - Drag-and-drop file selection
  - Transfer status tracking

#### File Metadata Tab
- Create and manage file metadata entries
- Track file ownership, size, type, and status
- View all files with filtering
- Update and delete metadata
- Status badges (COMPLETED, UPLOADING, FAILED)
- Formatted file size display

### UI/UX Features
- Dark mode support with theme toggle
- Responsive design (mobile, tablet, desktop)
- Real-time status indicators
- Smooth animations and transitions
- Modern card-based layout
- Accessible form controls

## Testing the System

### 1. Access the Frontend
Open http://localhost:3000 in your browser

### 2. Register and Login
- Click "Get Started" or "Enter Dashboard"
- Register a new account with username and password
- Login with your credentials

### 3. Add Contacts
- In the Network Manager section, add contacts by username
- Create groups for mesh broadcasting

### 4. Transfer Files
- Select a file using the file picker
- Choose a contact or group as the recipient
- Click "Start WebRTC Transfer"
- Monitor real-time progress

### 5. Manage File Metadata
- Switch to the "File Metadata" tab
- Create metadata entries for your files
- Track file ownership, status, and details
- Update or delete metadata as needed

### 6. Test P2P Transfer (Multiple Browsers)
Open the dashboard in multiple browser windows:
1. Register different users in each window
2. Add each other as contacts
3. Send files between peers
4. Watch real-time WebRTC transfers

See `file-transfer-service/README.md` for detailed API documentation.

## Architecture Highlights

### Service Communication
- All services register with Eureka for discovery
- API Gateway routes requests to appropriate services
- JWT tokens validated at gateway level
- Services communicate via REST APIs

### Security
- JWT-based authentication
- Token validation in API Gateway filter
- Secure WebRTC signaling
- CORS configuration for frontend

### P2P File Transfer Flow
1. User authenticates and gets JWT token
2. Peer registers with Peer Management Service
3. User selects file and target peer/group
4. WebRTC connection established via signaling
5. File transferred directly peer-to-peer
6. Metadata tracked in File Metadata Service

### Database Schema
Each service has its own H2 in-memory database:
- **Auth Service**: User credentials
- **Peer Management Service**: Peers, contacts, groups
- **File Transfer Service**: File chunks, transfer metadata
- **File Metadata Service**: File information and ownership

## Project Structure

```
p2p-microservices/
├── service-registry/          # Eureka Server (8761)
├── api-gateway/              # Spring Cloud Gateway (8080)
├── auth-service/             # Authentication Service (8085)
├── peer-management-service/  # Peer & Network Management (8086)
├── file-transfer-service/    # WebRTC File Transfer (8083)
├── file-metadata-service/    # File Metadata Tracking (8084)
├── frontend/                 # Next.js Frontend (3000)
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   └── services/        # API services
│   └── public/              # Static assets
├── docker-compose.yml        # Docker orchestration
└── pom.xml                  # Parent Maven POM
```

## Port Allocation

| Service | Port | Description |
|---------|------|-------------|
| Service Registry | 8761 | Eureka Dashboard |
| API Gateway | 8080 | Single entry point |
| File Transfer | 8083 | WebRTC file transfer |
| File Metadata | 8084 | Metadata management |
| Auth Service | 8085 | Authentication |
| Peer Management | 8086 | Peer & network |
| Frontend | 3000 | Next.js dashboard |

## Development

### Adding a New Service

1. Create a new Maven module in `pom.xml`
2. Add Spring Boot dependencies
3. Enable Eureka client with `@EnableDiscoveryClient`
4. Configure `application.yml` with unique port and service name
5. Register routes in API Gateway if needed
6. Add service to `docker-compose.yml`

### Frontend Development

```bash
cd frontend
npm run dev      # Development server
npm run build    # Production build
npm run lint     # Lint code
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is open source and available under the MIT License.
