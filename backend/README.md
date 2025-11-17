# RBAC Base - Backend API

A NestJS-based REST API with Role-Based Access Control (RBAC), JWT authentication, and PostgreSQL database.

## Features

- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Authorization**: Role-based access control (Admin, Moderator, User)
- **User Management**: Full CRUD operations with role protection
- **Database**: PostgreSQL with TypeORM
- **Validation**: Input validation with class-validator
- **CORS**: Enabled for frontend integration

## Technology Stack

- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for TypeScript and JavaScript
- **PostgreSQL** - Relational database
- **Passport** - Authentication middleware
- **JWT** - JSON Web Tokens
- **bcrypt** - Password hashing

## Quick Start

### Prerequisites

- Node.js 20.x or higher
- Docker and Docker Compose (for database)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env` and update values:
   ```bash
   cp .env.example .env
   ```

   Environment variables:
   ```
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

3. **Start the PostgreSQL database:**
   ```bash
   docker-compose up -d
   ```

4. **Run the application:**
   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

The API will be available at `http://localhost:3000/api`

## Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in watch mode (development)
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start in production mode
- `npm run build` - Build the application
- `npm run format` - Format code with Prettier
- `npm run lint` - Lint code with ESLint
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:e2e` - Run e2e tests
- `npm run test:cov` - Generate test coverage

## Database Management

### Using Docker Compose

The project includes a Docker Compose configuration with PostgreSQL and Adminer.

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs -f postgres
```

### Access Adminer (Database UI)

Navigate to `http://localhost:8080`:
- **System**: PostgreSQL
- **Server**: postgres
- **Username**: rbacuser
- **Password**: rbacpassword
- **Database**: rbacbase

## API Endpoints

### Authentication

**Register User**
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123",
  "role": "user" (optional, default: "user")
}

Response: { access_token, user }
```

**Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: { access_token, user }
```

### Users (Protected)

All user endpoints require JWT authentication via Bearer token.

**Get Current User**
```
GET /api/users/me
Authorization: Bearer {token}

Roles: All authenticated users
```

**List All Users**
```
GET /api/users
Authorization: Bearer {token}

Roles: Admin, Moderator
```

**Get User by ID**
```
GET /api/users/:id
Authorization: Bearer {token}

Roles: Admin, Moderator
```

**Create User**
```
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123",
  "role": "admin|moderator|user"
}

Roles: Admin only
```

**Update User**
```
PATCH /api/users/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "newpassword123" (optional),
  "role": "admin|moderator|user",
  "isActive": true|false
}

Roles: Admin only
```

**Update Own Profile**
```
PATCH /api/users/me/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "newpassword123" (optional)
}

Roles: All authenticated users
Note: Cannot change own role
```

**Delete User**
```
DELETE /api/users/:id
Authorization: Bearer {token}

Roles: Admin only
```

## Role-Based Access Control

### Roles

- **admin**: Full access to all endpoints
- **moderator**: Can view all users and individual user details
- **user**: Default role, can only access own profile

### Creating Your First Admin User

1. Register a user via the API:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "firstName": "Admin",
       "lastName": "User",
       "password": "password123"
     }'
   ```

2. Access Adminer at `http://localhost:8080` and update the user's role to `admin`

3. Login with admin credentials to get admin access

## Project Structure

```
backend/
├── api/
│   └── src/
│       ├── app/              # Main application module
│       ├── auth/             # Authentication module
│       │   ├── strategies/   # Passport strategies (JWT, Local)
│       │   ├── auth.service.ts
│       │   ├── auth.controller.ts
│       │   └── auth.module.ts
│       ├── users/            # Users module
│       │   ├── entities/     # User entity
│       │   ├── dto/         # Data Transfer Objects
│       │   ├── users.service.ts
│       │   ├── users.controller.ts
│       │   └── users.module.ts
│       ├── common/           # Shared code
│       │   ├── decorators/   # Custom decorators (@Roles, @CurrentUser)
│       │   ├── guards/       # Auth guards (JWT, Local, Roles)
│       │   └── enums/        # Enumerations (Role)
│       └── main.ts           # Application entry point
├── api-e2e/                  # E2E tests
├── docker-compose.yml        # Docker services
├── .env                      # Environment variables
├── .env.example              # Environment template
└── package.json              # Dependencies and scripts
```

## Deployment

### Production Build

```bash
npm run build
```

The compiled files will be in the `dist/` directory.

### Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Update `.env` with production database credentials
3. Change `JWT_SECRET` to a secure random string
4. Run migrations if needed
5. Start the application:
   ```bash
   npm run start:prod
   ```

### Environment Variables for Production

- Set `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` to your production database
- Generate a strong `JWT_SECRET` (use a secure random generator)
- Disable `synchronize` in TypeORM for production (use migrations instead)

## Security Considerations

- **JWT_SECRET**: Use a strong, random secret in production
- **Password Hashing**: bcrypt with salt rounds of 10
- **CORS**: Configure for specific origins in production
- **Database**: Never use `synchronize: true` in production
- **Environment Variables**: Never commit `.env` file
- **Validation**: All inputs validated with class-validator
- **Authentication**: JWT tokens expire based on `JWT_EXPIRES_IN`

## License

MIT
