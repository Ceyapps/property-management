# RBAC Base - Architecture Analysis Summary

## Documents Created

This analysis includes two comprehensive architecture documents:

1. **CLAUDE_ARCHITECTURE.md** (38 KB, 1393 lines)
   - Deep-dive technical documentation
   - Complete file-by-file walkthrough
   - Detailed code examples for each pattern
   - Cross-app communication flows
   - Database schema and entity relationships

2. **ARCHITECTURE_QUICK_REFERENCE.md** (10 KB, 280 lines)
   - Quick lookup guide
   - Code snippets for common tasks
   - Troubleshooting and tips
   - Command reference
   - Testing user flow

---

## High-Level Architecture Overview

### Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, TypeScript, Vite | Admin UI with protected routes |
| **Backend** | NestJS, Express | REST API with modular architecture |
| **Database** | PostgreSQL, TypeORM | Relational data with ORM |
| **Authentication** | JWT, Passport.js, bcrypt | Stateless token-based auth |
| **Build** | Nx, npm workspaces | Monorepo with parallel tasks |
| **Styling** | Tailwind CSS | Utility-first CSS |

### Architecture Type

**Nx Monorepo** with:
- Unified root `package.json` for shared dependencies
- Independent `package.json` files in backend/ and frontend/
- Parallel execution with `npm run dev`
- Task caching for faster rebuilds

---

## Key Architectural Patterns

### 1. Backend Authentication (3-Layer)

**Layer 1: Credentials** → LocalStrategy
- Email + password sent to `/auth/login`
- LocalStrategy validates with bcrypt.compare()
- Password never stored in plain text (10-round bcrypt)

**Layer 2: Token Generation** → AuthService
- JWT created with payload: `{ email, sub (userId), role }`
- Returned with user object to client
- Client stores in localStorage

**Layer 3: Token Validation** → JwtStrategy + JwtAuthGuard
- Subsequent requests include Bearer token
- JwtStrategy verifies signature and loads full user from DB
- User object attached to `req.user` for controllers

### 2. Authorization (Role-Based Access Control)

**Guard Composition** at controller level:
```
@UseGuards(JwtAuthGuard, RolesGuard)
```

**Decorator-Based Access** at method level:
```
@Roles('admin', 'moderator')
```

**RolesGuard Logic**:
- Reads @Roles decorator metadata
- Checks if user.role.name matches required roles
- OR checks for wildcard `permissions['*']` (admin bypass)

**Custom Decorator for Current User**:
```
@CurrentUser() user
```
- Extracts user from req.user set by JwtStrategy
- Enables self-service operations

### 3. Frontend State Management (Context + localStorage)

**AuthContext Pattern**:
- Provider wraps entire app
- Stores user + loading state
- Provides login/logout functions
- Persists token/user to localStorage on login
- Validates token on app mount

**useAuth() Hook**:
- Custom hook for accessing auth state
- Throws if used outside AuthProvider
- Available in any component

### 4. HTTP Client with Interceptors

**Request Interceptor**:
- Automatically adds `Authorization: Bearer {token}` to all requests
- No manual token passing needed

**Response Interceptor**:
- Catches 401 responses (token expired)
- Clears localStorage
- Redirects to /login
- Centralized auth error handling

### 5. Database Relationships & Eager Loading

**TypeORM @ManyToOne with eager: true**:
```typescript
@ManyToOne(() => Role, (role) => role.users, { eager: true })
role: Role;
```
- Role always loaded with User (no N+1 queries)
- RolesGuard always has access to role object
- Frontend receives complete role data

### 6. Module-Based Organization (NestJS)

Each feature module contains:
- **Module** file: imports dependencies, registers controllers/services
- **Controller**: HTTP endpoints
- **Service**: Business logic
- **DTO**: Input validation
- **Entity**: Database schema
- **Guard** (if needed): Authorization logic

Modules export services for other modules to inject.

---

## Critical Files & Their Roles

### Backend (NestJS)

| File | Purpose | Key Exports |
|------|---------|------------|
| main.ts | Bootstrap, global setup | NestFactory, app config |
| app.module.ts | Feature imports, DB config | All modules wired together |
| auth/auth.service.ts | Token generation, validation | login(), validateUser() |
| auth/strategies/ | Passport implementations | LocalStrategy, JwtStrategy |
| common/guards/ | Authentication/authorization | JwtAuthGuard, RolesGuard |
| users/users.service.ts | User CRUD, password hashing | create(), update(), findByEmail() |
| users/entities/user.entity.ts | DB schema, relationships | User entity with eager role |
| roles/roles.service.ts | Role CRUD, seeding | seedDefaultRoles() |
| roles/entities/role.entity.ts | DB schema, JSONB permissions | Role entity |

### Frontend (React)

| File | Purpose | Key Exports |
|------|---------|------------|
| main.tsx | React entry point | ReactDOM.render |
| app.tsx | Router root, AuthProvider | Routes, nested layout |
| contexts/AuthContext.tsx | Auth state, session persistence | AuthProvider, useAuth() |
| services/api.ts | HTTP client, interceptors | authApi, usersApi, rolesApi |
| components/auth/ProtectedRoute.tsx | Route guard wrapper | checks auth, redirects |
| components/layout/DashboardLayout.tsx | Main nav, Outlet | navbar, navigation |
| pages/* | Route pages | LoginPage, UsersListPage, etc. |
| types/index.ts | TypeScript interfaces | User, Role, DTOs |

---

## Data Flow Examples

### User Registration

```
Frontend: POST /auth/register
  ↓
Backend: AuthController.register()
  ↓
UsersService.create()
  → Check email uniqueness
  → Hash password with bcrypt
  → Save to DB
  ↓
AuthService.login()
  → Generate JWT with role
  → Return { access_token, user }
  ↓
Frontend: AuthContext.login()
  → localStorage.setItem('token')
  → localStorage.setItem('user')
  → setUser(response.user)
```

### Protected API Request

```
Frontend: axios GET /api/users
  ↓
Request Interceptor
  → Add Authorization: Bearer {token}
  ↓
Backend: JwtAuthGuard
  → JwtStrategy.validate()
  → Verify JWT signature
  → Fetch user from DB (eager load role)
  → Attach to req.user
  ↓
RolesGuard
  → Read @Roles('admin') metadata
  → Check req.user.role.name === 'admin'
  → Check req.user.role.permissions['*']
  ↓
UsersController.findAll()
  → Access req.user for current user
  → Return filtered results
  ↓
Frontend: Response Interceptor
  → Check for 401 (if token expired)
  → Update local state
```

### Role-Based Access Decision

```
Request arrives at protected endpoint:

RolesGuard.canActivate():
  1. Get @Roles decorator (e.g., @Roles('admin', 'moderator'))
  2. Get user from request.user
  3. Check: user.role.name in ['admin', 'moderator']?
     OR check: user.role.permissions['*'] === true?
  4. Return true/false
```

---

## Default Roles & Permissions

### Admin
- **permissions**: `{ '*': true }`
- **meaning**: Wildcard permission, can access everything
- **can**: Create/edit/delete users and roles

### Moderator
- **permissions**: `{ 'users:read': true, 'users:list': true }`
- **meaning**: Specific permissions for user operations
- **can**: View users, view user details

### User
- **permissions**: `{ 'users:read:own': true }`
- **meaning**: Can only access own data
- **can**: View own profile, update own profile

---

## Security Implementation

### Passwords
- 10-round bcrypt hashing on create/update
- `@Exclude()` decorator prevents password in responses
- `bcrypt.compare()` validates on login

### JWT
- Secret stored in .env (never committed)
- Expiration set to 7 days default
- Signature verified on every protected request
- Contains: email, userId, role

### Session Management
- Stateless JWT (no session database)
- Token stored in localStorage (XSS risk possible, HTTPS required)
- Token automatically added to all requests
- 401 triggers logout + redirect to /login

### Route Protection
- Backend: JwtAuthGuard + RolesGuard on controller
- Frontend: ProtectedRoute component wrapper
- Database: User.isActive field prevents inactive users

### Input Validation
- class-validator DTOs on all endpoints
- Whitelist + forbidNonWhitelisted pipes in NestJS
- Frontend types match backend DTOs

---

## Common Development Tasks

### Adding New Protected Endpoint

**Backend**:
1. Create controller method
2. Add `@Roles('admin')` decorator
3. Use `@CurrentUser()` to get current user
4. Inject service with user context

**Frontend**:
1. Add API call in api.ts
2. Use in component with useAuth() hook
3. Handle loading/error states

### Adding New Role with Custom Permissions

**Backend**:
1. In RolesService.seedDefaultRoles(), add role object
2. Set permissions object: `{ 'feature:read': true, 'feature:write': false }`
3. Use in controllers with `@Roles('newRole')`

**Authorization Check**:
- Simple case: `@Roles('roleName')`
- Complex case: Add custom guard checking `user.role.permissions['specific:action']`

### Modifying User Flow

**Login**: Modify LocalStrategy or AuthService.validateUser()
**Token**: Modify JWT payload in AuthService.login()
**Profile**: User can update own profile without admin, controlled in controller

---

## Testing the System

### Prerequisites
```bash
npm install
npm run db:up
npm run dev
```

### Create First Admin
```bash
# Register user via API
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","firstName":"Admin","lastName":"User","password":"password123"}'

# Via Adminer (http://localhost:8080):
# - Login: postgres / rbacuser / rbacpassword
# - Find user in users table
# - Update roleId to admin UUID

# Via Admin Portal (http://localhost:4200):
# - Login with credentials
# - Should see full admin interface
```

---

## Performance Characteristics

1. **Database Queries**: Minimal
   - User.role eager-loaded (1 query for user + role)
   - RolesGuard doesn't trigger additional queries

2. **Token Validation**: Fast
   - JWT signature validation is cryptographic (no DB)
   - Only on protected routes

3. **Session Persistence**: Instant
   - localStorage.getItem() is synchronous
   - No server round-trip for session check

4. **Build Time**: Fast
   - Nx caching speeds up rebuilds
   - Parallel frontend/backend builds

---

## Deployment Readiness

### Backend Ready For
- **PaaS**: Heroku, Railway, Render (PROCFILE included)
- **Containers**: Docker (Dockerfile or docker-compose)
- **VPS**: Any Linux with Node.js + PostgreSQL
- **Output**: `backend/dist/` directory

### Frontend Ready For
- **Static Hosting**: Vercel, Netlify, Cloudflare Pages
- **CDN**: S3 + CloudFront, Google Cloud Storage
- **Web Servers**: Nginx, Apache
- **Output**: `frontend/dist/` directory

### Production Checklist
- [ ] Change JWT_SECRET to strong random value
- [ ] Use HTTPS (force redirect from HTTP)
- [ ] Configure CORS to specific origin
- [ ] Use production database (not sqlite)
- [ ] Set NODE_ENV=production
- [ ] Add logging/monitoring
- [ ] Set up database backups
- [ ] Add rate limiting on auth endpoints
- [ ] Use strong password requirements
- [ ] Add password reset flow
- [ ] Enable HSTS headers

---

## Troubleshooting & Debugging

### Common Issues & Solutions

| Problem | Cause | Solution |
|---------|-------|----------|
| 401 Unauthorized | Token expired/invalid | Clear localStorage, re-login |
| CORS Error | CORS not enabled | Check app.enableCors() in main.ts |
| Role check fails | User missing role relation | RolesGuard requires user.role populated |
| Password wrong | Password not hashed | Verify bcrypt.hash() called in UsersService |
| Cannot delete role | System role protected | Check isSystem flag in RolesService.remove() |
| Token not in requests | Interceptor missing | Verify api.ts interceptor setup |
| 404 routes | Prefix missing | Backend routes prefixed with /api |

---

## File Locations Summary

```
Absolute Paths:

Backend:
/Users/ad-015/aiprojects/rbacbase/backend/api/src/main.ts
/Users/ad-015/aiprojects/rbacbase/backend/api/src/app/app.module.ts
/Users/ad-015/aiprojects/rbacbase/backend/api/src/auth/auth.service.ts
/Users/ad-015/aiprojects/rbacbase/backend/api/src/auth/strategies/
/Users/ad-015/aiprojects/rbacbase/backend/api/src/users/
/Users/ad-015/aiprojects/rbacbase/backend/api/src/roles/
/Users/ad-015/aiprojects/rbacbase/backend/api/src/common/

Frontend:
/Users/ad-015/aiprojects/rbacbase/frontend/admin-portal/src/main.tsx
/Users/ad-015/aiprojects/rbacbase/frontend/admin-portal/src/app/app.tsx
/Users/ad-015/aiprojects/rbacbase/frontend/admin-portal/src/contexts/AuthContext.tsx
/Users/ad-015/aiprojects/rbacbase/frontend/admin-portal/src/services/api.ts
/Users/ad-015/aiprojects/rbacbase/frontend/admin-portal/src/components/
/Users/ad-015/aiprojects/rbacbase/frontend/admin-portal/src/pages/
/Users/ad-015/aiprojects/rbacbase/frontend/admin-portal/src/types/index.ts

Config:
/Users/ad-015/aiprojects/rbacbase/.env
/Users/ad-015/aiprojects/rbacbase/docker-compose.yml
/Users/ad-015/aiprojects/rbacbase/package.json
```

---

## Key Takeaways

1. **Full Stack RBAC**: Complete example from database to UI
2. **Production Patterns**: Uses industry-standard auth (JWT + Passport)
3. **Type Safe**: TypeScript throughout, matching DTOs on both ends
4. **Modular**: Each feature self-contained with dependency injection
5. **Scalable**: Easy to add new modules, roles, and permissions
6. **Secure**: Password hashing, token validation, role-based routes
7. **Developer Friendly**: Clear separation of concerns, reusable patterns
8. **Well Organized**: Monorepo structure, npm workspaces

---

## Next Steps for Development

1. **Understanding**: Start with CLAUDE_ARCHITECTURE.md for deep dive
2. **Quick Reference**: Use ARCHITECTURE_QUICK_REFERENCE.md while coding
3. **New Features**: Follow pattern examples for adding routes/roles
4. **Testing**: Use testing user flow in quick reference guide
5. **Deployment**: Check production checklist before release

---

Generated: November 17, 2025
