# RBAC API

A NestJS-based REST API with Role-Based Access Control (RBAC) and JWT authentication.

## Features

- User authentication with JWT tokens
- Role-based access control (Admin, Moderator, User)
- User CRUD operations with role protection
- PostgreSQL database with TypeORM
- Input validation with class-validator
- Password hashing with bcrypt

## Available Roles

- `admin`: Full access to all endpoints
- `moderator`: Can view all users and individual user details
- `user`: Default role, can only access their own profile

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ email, firstName, lastName, password, role? }`
  - Returns: JWT token and user data

- `POST /api/auth/login` - Login
  - Body: `{ email, password }`
  - Returns: JWT token and user data

### Users (Protected)

All user endpoints require JWT authentication via Bearer token.

- `GET /api/users/me` - Get current user profile
  - Roles: All authenticated users

- `GET /api/users` - Get all users
  - Roles: Admin, Moderator

- `GET /api/users/:id` - Get user by ID
  - Roles: Admin, Moderator

- `POST /api/users` - Create new user
  - Roles: Admin only
  - Body: `{ email, firstName, lastName, password, role? }`

- `PATCH /api/users/:id` - Update user (including role)
  - Roles: Admin only
  - Body: `{ email?, firstName?, lastName?, password?, role?, isActive? }`

- `PATCH /api/users/me/profile` - Update own profile (cannot change role)
  - Roles: All authenticated users
  - Body: `{ email?, firstName?, lastName?, password? }`

- `DELETE /api/users/:id` - Delete user
  - Roles: Admin only

## Setup

1. Start the database:
   ```bash
   docker-compose up -d
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=rbacuser
   DB_PASSWORD=rbacpassword
   DB_DATABASE=rbacbase
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   PORT=3000
   NODE_ENV=development
   ```

4. Start the API:
   ```bash
   npx nx serve api
   ```

The API will be available at `http://localhost:3000/api`

## Database Management

Access Adminer (database UI) at `http://localhost:8080`:
- System: PostgreSQL
- Server: postgres
- Username: rbacuser
- Password: rbacpassword
- Database: rbacbase

## Example Usage

### Register a new user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "password123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get your profile (authenticated):
```bash
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create admin user (first user should be created via register, then promote in DB):
```bash
# After registering first user, update their role in database to 'admin'
# Then you can create other users with specific roles
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "moderator@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "password": "password123",
    "role": "moderator"
  }'
```
