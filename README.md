# RBAC Base - Monorepo

A complete Role-Based Access Control (RBAC) system with backend API and frontend admin portal managed as an Nx monorepo.

## Table of Contents

- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Applications](#applications)
- [Getting Started](#getting-started)
- [Project Features](#project-features)
- [Technology Stack](#technology-stack)
- [Deployment](#deployment)
- [Development Workflow](#development-workflow)
- [Environment Variables](#environment-variables)
- [Database Management](#database-management)
- [API Documentation](#api-documentation)
- [Security Considerations](#security-considerations)
- [Workspace Management](#workspace-management)

## Project Structure

This repository uses Nx workspace with separate backend and frontend applications:

```
rbacbase/
├── backend/          # NestJS API with PostgreSQL
│   ├── api/         # API source code
│   ├── api-e2e/     # E2E tests
│   ├── docker-compose.yml
│   ├── package.json
│   └── README.md
│
├── frontend/        # React Admin Portal
│   ├── admin-portal/  # Frontend source code
│   ├── package.json
│   └── README.md
│
├── docker-compose.yml  # Root docker compose for database
├── package.json        # Root workspace configuration
└── node_modules/       # Shared dependencies
```

## Quick Start

### Option 1: Run Both Projects with Nx (Recommended)

From the root directory:

```bash
# Install all dependencies (root + backend + frontend)
npm install

# Start database (from root or backend directory)
npm run db:up

# Run both API and Admin Portal in parallel
npm run dev
```

- Backend API: `http://localhost:3000/api`
- Admin Portal: `http://localhost:4200`
- Database UI (Adminer): `http://localhost:8080`

### Option 2: Run Individually

```bash
# Terminal 1 - Backend only
npm run api:serve

# Terminal 2 - Frontend only
npm run admin:serve
```

## Applications

### Backend API

**Location:** `backend/`

A NestJS REST API with:
- JWT authentication
- Role-based access control (Admin, Moderator, User)
- PostgreSQL database with TypeORM
- User management CRUD operations
- Docker setup for database

**Tech Stack:** NestJS, TypeORM, PostgreSQL, Passport, JWT

[View Backend Documentation](backend/README.md)

**Quick Commands:**
```bash
cd backend
npm install
docker-compose up -d    # Start PostgreSQL
npm run start:dev       # Start API
```

### Frontend Admin Portal

**Location:** `frontend/`

A React admin interface for managing users:
- Admin-only access control
- User management UI (CRUD)
- JWT authentication
- Responsive design with Tailwind CSS

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, React Router

[View Frontend Documentation](frontend/README.md)

**Quick Commands:**
```bash
cd frontend
npm install
npm run dev             # Start admin portal
```

## Getting Started

### 1. Install Dependencies

From the root directory:

```bash
# Install all dependencies for root, backend, and frontend
npm install
```

### 2. Configure Environment

```bash
# Copy root environment file
cp .env.example .env

# Edit .env with your database settings
# Default values should work for local development
```

### 3. Start Database

```bash
# Start PostgreSQL and Adminer using Docker
npm run db:up

# View database logs (optional)
npm run db:logs

# Stop database when done
npm run db:down
```

### 4. Start Applications

```bash
# Run both backend and frontend in parallel (recommended)
npm run dev

# OR run individually
npm run api:serve    # Backend only
npm run admin:serve  # Frontend only
```

### 5. Create Admin User

```bash
# Register first user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "password": "password123"
  }'

# Access Adminer at http://localhost:8080
# Login: postgres / rbacuser / rbacpassword
# Update user role to 'admin' in users table

# Login to admin portal at http://localhost:4200
```

## Project Features

### Authentication
- JWT-based authentication
- bcrypt password hashing
- Token expiration and validation
- Protected routes

### Authorization (RBAC)
Three role levels:
- **Admin**: Full access to all resources
- **Moderator**: Can view users and details
- **User**: Default role, access to own profile only

### User Management
- Create, read, update, delete users
- Role assignment (admin only)
- Self-service profile updates
- Email uniqueness validation
- Active/inactive status

## Technology Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeORM** - Database ORM
- **PostgreSQL** - Database
- **Passport.js** - Authentication
- **JWT** - Token-based auth
- **bcrypt** - Password hashing

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client

## Deployment

Both applications can be built and deployed independently:

### Building for Production

```bash
# Build backend
npm run api:build

# Build frontend
npm run admin:build
```

### Backend Deployment

The backend is a standard NestJS application that can be deployed to:
- **PaaS**: Heroku, Railway, Render, DigitalOcean App Platform
- **Containers**: Docker, Kubernetes
- **VPS**: Any Linux server with Node.js and PostgreSQL

Build output is located in `backend/dist/`

See [backend/README.md](backend/README.md) for detailed deployment instructions.

### Frontend Deployment

The frontend is a static SPA that can be deployed to:
- **Static Hosting**: Vercel, Netlify, Cloudflare Pages
- **CDN**: AWS S3 + CloudFront, Google Cloud Storage
- **Any web server**: Nginx, Apache

Build output is located in `frontend/dist/`

See [frontend/README.md](frontend/README.md) for detailed deployment instructions.

## Development Workflow

### Using Nx Commands (Recommended)

From the root directory:

```bash
# Serve applications
npm run api:serve        # Backend only
npm run admin:serve      # Frontend only
npm run dev              # Both in parallel

# Build applications
npm run api:build        # Build backend
npm run admin:build      # Build frontend

# Test backend
npm run api:test         # Unit tests

# Database management
npm run db:up            # Start database
npm run db:down          # Stop database
npm run db:logs          # View database logs
```

### Direct Commands (Alternative)

You can also work directly in each directory:

```bash
# Backend (from backend/ directory)
cd backend
npm run start:dev        # Development with watch mode
npm run test             # Run tests
npm run test:e2e         # Run e2e tests
npm run build            # Build for production

# Frontend (from frontend/ directory)
cd frontend
npm run dev              # Development server
npm run build            # Build for production
npm run preview          # Preview production build
```

## Environment Variables

### Root (.env)
Located at the root of the project:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=rbacuser
DB_PASSWORD=rbacpassword
DB_DATABASE=rbacbase
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

### Backend (.env)
The backend also has a `.env` file (backend/.env) with the same database configuration.

### Frontend (.env)
Located at `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

## Database Management

Access the database UI (Adminer) at `http://localhost:8080`:
- **System**: PostgreSQL
- **Server**: postgres
- **Username**: rbacuser
- **Password**: rbacpassword
- **Database**: rbacbase

## API Documentation

API runs at `http://localhost:3000/api`

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

**Users (Protected):**
- `GET /api/users/me` - Get current user
- `GET /api/users` - List all users (Admin, Moderator)
- `GET /api/users/:id` - Get user (Admin, Moderator)
- `POST /api/users` - Create user (Admin)
- `PATCH /api/users/:id` - Update user (Admin)
- `PATCH /api/users/me/profile` - Update own profile
- `DELETE /api/users/:id` - Delete user (Admin)

See [backend/README.md](backend/README.md) for full API documentation.

## Security Considerations

- **Environment Variables**: Never commit `.env` files
- **JWT Secret**: Use strong, random secret in production
- **Database**: Use migrations in production (not synchronize)
- **CORS**: Configure for specific origins in production
- **HTTPS**: Always use HTTPS in production
- **Passwords**: Minimum 6 characters enforced
- **Admin Access**: Only admins can access admin portal

## Workspace Management

This project uses an Nx monorepo structure with npm workspaces:

- **Root workspace**: Contains shared dependencies and build scripts
- **Backend workspace**: Independent package with its own dependencies (`backend/package.json`)
- **Frontend workspace**: Independent package with its own dependencies (`frontend/package.json`)

### Benefits of Nx Monorepo Structure

- **Shared Dependencies**: Common packages are installed once at the root level
- **Parallel Execution**: Run multiple tasks simultaneously with `npm run dev`
- **Unified Commands**: Manage both apps from the root directory
- **Task Caching**: Nx caches build outputs for faster rebuilds
- **Code Sharing**: Easy to share types and utilities between apps

### Available Root Scripts

```bash
npm run api:serve      # Serve backend API
npm run api:build      # Build backend API
npm run api:test       # Test backend API
npm run admin:serve    # Serve admin portal
npm run admin:build    # Build admin portal
npm run dev            # Run both API and admin portal in parallel
npm run db:up          # Start database
npm run db:down        # Stop database
npm run db:logs        # View database logs
```

Each workspace can also be developed independently by navigating to its directory and using its local scripts.

## License

MIT

## Contributing

1. Clone the repository
2. Create a feature branch
3. Make your changes
4. Test both backend and frontend
5. Submit a pull request

## Support

For issues and questions:
- Backend API: See [backend/README.md](backend/README.md)
- Frontend Portal: See [frontend/README.md](frontend/README.md)
