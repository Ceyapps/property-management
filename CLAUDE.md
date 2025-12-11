# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Nx monorepo containing a Property Management system with RBAC (Role-Based Access Control). It consists of:
- **Backend**: NestJS REST API with PostgreSQL, TypeORM, JWT authentication
- **Frontend**: React 19 admin portal with Vite, Tailwind CSS, React Router

## Common Commands

### Development
```bash
# Install all dependencies (root + workspaces)
npm install

# Start database
npm run db:up

# Run both backend and frontend in parallel
npm run dev

# Run individually
npm run api:serve      # Backend at http://localhost:3000/api
npm run admin:serve    # Frontend at http://localhost:4200
```

### Building & Testing
```bash
# Build
npm run api:build      # Output: backend/dist/
npm run admin:build    # Output: frontend/dist/

# Test
npm run api:test       # Backend unit tests
cd backend && npm run test:e2e  # E2E tests
```

### Database
```bash
npm run db:up          # Start PostgreSQL + Adminer
npm run db:down        # Stop database
npm run db:logs        # View logs
# Adminer UI: http://localhost:8080 (postgres/rbacuser/rbacpassword)
```

## Architecture

### Monorepo Structure
```
rbacbase/
├── backend/
│   ├── api/src/
│   │   ├── auth/           # Authentication (login, register, JWT)
│   │   ├── users/          # User CRUD with RBAC
│   │   ├── common/
│   │   │   ├── decorators/ # @Roles(), @Public()
│   │   │   └── guards/     # JwtAuthGuard, RolesGuard
│   │   ├── database/       # TypeORM entities
│   │   └── main.ts         # NestJS bootstrap
│   └── api-e2e/
├── frontend/
│   └── admin-portal/src/
│       ├── components/     # UserList, UserForm, Layout
│       ├── context/        # AuthContext (global state)
│       ├── services/       # API client with axios
│       └── App.tsx         # Routes + ProtectedRoute
└── docker-compose.yml      # PostgreSQL + Adminer
```

### Authentication & Authorization Flow

**Backend (NestJS + Passport + JWT)**
1. **Registration/Login**: `AuthController` → `AuthService.validateUser()` → bcrypt password check → JWT token generation
2. **Request Protection**: `@UseGuards(JwtAuthGuard)` → Passport validates JWT → User attached to `req.user`
3. **Role Authorization**: `@Roles('admin', 'moderator')` → `RolesGuard` checks user roles → Allow/Deny

**Key Backend Patterns:**
- `@Public()` decorator: Skip JWT authentication for public routes
- `@Roles(...roles)` decorator: Define required roles for endpoints
- `RolesGuard`: Checks if `req.user.role` matches required roles
- `JwtAuthGuard`: Global guard (all routes protected by default)

**Frontend (React Context + Axios)**
1. **Auth State**: `AuthContext` provides `{ user, login, logout, isAuthenticated }`
2. **Token Storage**: JWT stored in `localStorage`, attached to requests via axios interceptor
3. **Protected Routes**: `ProtectedRoute` wrapper checks auth + admin role
4. **API Client**: `api.ts` configures axios with base URL, token interceptor, 401 handler

### Database Design

**User Entity** (`backend/api/src/database/entities/user.entity.ts`)
```typescript
User {
  id: uuid (PK)
  email: string (unique)
  password: string (bcrypt hashed)
  firstName: string
  lastName: string
  role: 'admin' | 'moderator' | 'user'
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Key Patterns:**
- TypeORM with PostgreSQL
- `synchronize: true` in development (use migrations in production)
- Password hashing in `AuthService` before saving
- Validation via `class-validator` decorators in DTOs

### Frontend State Management

**AuthContext Pattern:**
```typescript
// Global auth state
const { user, login, logout, isAuthenticated } = useAuth();

// Login flow
login(email, password) → POST /auth/login → Save token to localStorage → Set user state

// Token persistence
useEffect(() => { check localStorage → fetchCurrentUser() → restore session })

// Axios interceptor
request.headers.Authorization = `Bearer ${token}`
401 response → logout() → redirect to login
```

**Component Structure:**
- `Layout`: Header with logout, wraps all pages
- `ProtectedRoute`: Validates auth + admin role before rendering
- `UserList`: Fetches users, shows table, delete action
- `UserForm`: Create/edit form with validation

## Environment Variables

**Root & Backend** (`.env`):
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

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000/api
```

## Key Files & Their Roles

**Backend:**
- `backend/api/src/main.ts`: App bootstrap, CORS, global guards, validation pipe
- `backend/api/src/auth/auth.service.ts`: Login logic, JWT generation, password validation
- `backend/api/src/auth/strategies/jwt.strategy.ts`: Validates JWT tokens, extracts user
- `backend/api/src/common/guards/roles.guard.ts`: RBAC enforcement
- `backend/api/src/database/entities/user.entity.ts`: User model schema

**Frontend:**
- `frontend/admin-portal/src/context/AuthContext.tsx`: Global auth state + token management
- `frontend/admin-portal/src/services/api.ts`: Axios client with interceptors
- `frontend/admin-portal/src/App.tsx`: Routes + ProtectedRoute wrapper
- `frontend/admin-portal/src/components/users/UserList.tsx`: Main user management UI

## Development Patterns

### Adding a New Protected Endpoint (Backend)

```typescript
@Controller('resource')
export class ResourceController {
  @Get()
  @Roles('admin', 'moderator')  // Require admin or moderator role
  findAll() { /* ... */ }

  @Post()
  @Roles('admin')  // Admin only
  create() { /* ... */ }

  @Get('public')
  @Public()  // Skip authentication
  getPublic() { /* ... */ }
}
```

### Adding a New Frontend Route

1. Create component in `frontend/admin-portal/src/components/`
2. Add route in `App.tsx`:
   ```tsx
   <Route path="/new-page" element={
     <ProtectedRoute>
       <Layout><NewPage /></Layout>
     </ProtectedRoute>
   } />
   ```
3. Use `useAuth()` hook for user context
4. Call API via `api.get('/endpoint')` (token auto-attached)

### Database Migrations (Production)

Set `synchronize: false` in `backend/api/src/database/database.module.ts` and use TypeORM migrations:
```bash
cd backend
npm run typeorm migration:generate -- -n MigrationName
npm run typeorm migration:run
```

## Security Considerations

- **Passwords**: Bcrypt hashed with salt rounds = 10
- **JWT Secret**: Change `JWT_SECRET` in production (use env vars)
- **CORS**: Configured in `main.ts`, restrict origins in production
- **Validation**: All DTOs use `class-validator`, `ValidationPipe` enabled globally
- **Guards**: `JwtAuthGuard` is global, use `@Public()` to opt-out
- **Admin Creation**: First user must be manually promoted to admin via database (Adminer UI)

## Common Issues

**Database Connection Fails:**
- Ensure Docker is running: `docker ps`
- Check `.env` database credentials match `docker-compose.yml`
- Restart database: `npm run db:down && npm run db:up`

**401 Unauthorized:**
- Check JWT token in browser localStorage
- Verify `VITE_API_URL` points to correct backend
- Check user has correct role for the endpoint

**Frontend Build Fails:**
- Clear cache: `rm -rf frontend/node_modules frontend/dist`
- Reinstall: `cd frontend && npm install`

**Nx Cache Issues:**
- Clear Nx cache: `npx nx reset`

## API Endpoints

**Authentication:**
- `POST /api/auth/register` - Register new user (public)
- `POST /api/auth/login` - Login (returns JWT)

**Users (Protected):**
- `GET /api/users/me` - Get current user
- `GET /api/users` - List all users (admin, moderator)
- `GET /api/users/:id` - Get user by ID (admin, moderator)
- `POST /api/users` - Create user (admin)
- `PATCH /api/users/:id` - Update user (admin)
- `PATCH /api/users/me/profile` - Update own profile
- `DELETE /api/users/:id` - Delete user (admin)

## Testing

**Backend Unit Tests:**
```bash
npm run api:test                    # All tests
cd backend && npm run test -- auth  # Specific module
cd backend && npm run test -- --watch  # Watch mode
```

**Backend E2E Tests:**
```bash
cd backend
npm run test:e2e
```

## Workspace Notes

- This is an Nx monorepo with npm workspaces
- Root `node_modules` contains shared dependencies
- Each workspace (`backend/`, `frontend/`) has its own `package.json`
- Run `npm install` from root to install all dependencies
- Nx caches build outputs in `.nx/cache/`
