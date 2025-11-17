# RBAC Base - Monorepo

A complete Role-Based Access Control (RBAC) system with separate backend API and frontend admin portal.

## Project Structure

This repository contains two independent applications that can be deployed and maintained separately:

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
└── packages/        # (Legacy Nx structure - can be removed)
```

## Quick Start

### Option 1: Run Both Projects

From the root directory:

```bash
# Terminal 1 - Backend
cd backend
npm install
docker-compose up -d
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

- Backend API: `http://localhost:3000/api`
- Admin Portal: `http://localhost:4200`
- Database UI (Adminer): `http://localhost:8080`

### Option 2: Run Individually

Each project is now independent and can be run separately.

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

### 1. Set Up Backend

```bash
cd backend
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your settings

# Start database
docker-compose up -d

# Start API
npm run start:dev
```

### 2. Set Up Frontend

```bash
cd frontend
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env to point to your API

# Start frontend
npm run dev
```

### 3. Create Admin User

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

Both applications can be deployed independently:

### Backend Deployment

The backend is a standard NestJS application that can be deployed to:
- **PaaS**: Heroku, Railway, Render, DigitalOcean App Platform
- **Containers**: Docker, Kubernetes
- **VPS**: Any Linux server with Node.js and PostgreSQL

See [backend/README.md](backend/README.md#deployment) for details.

### Frontend Deployment

The frontend is a static SPA that can be deployed to:
- **Static Hosting**: Vercel, Netlify, Cloudflare Pages
- **CDN**: AWS S3 + CloudFront, Google Cloud Storage
- **Any web server**: Nginx, Apache

See [frontend/README.md](frontend/README.md#deployment) for details.

## Development Workflow

### Backend Development
```bash
cd backend
npm run start:dev        # Development with watch mode
npm run test             # Run tests
npm run test:e2e         # Run e2e tests
npm run build            # Build for production
```

### Frontend Development
```bash
cd frontend
npm run dev              # Development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Lint code
```

## Environment Variables

### Backend (.env)
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

### Frontend (.env)
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

## Migrating from Nx Monorepo

This project has been restructured from an Nx monorepo to separate projects:

- `packages/api` → `backend/api`
- `packages/admin-portal` → `frontend/admin-portal`
- Docker files → `backend/`

The `packages/` directory can be safely removed if you no longer need the Nx setup.

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
