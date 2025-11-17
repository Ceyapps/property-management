# RBAC Base - Quick Reference Guide

## Project at a Glance

- **Type**: Nx Monorepo with Backend (NestJS) + Frontend (React)
- **Database**: PostgreSQL with TypeORM
- **Auth**: JWT + Passport.js (Local + JWT strategies)
- **Styling**: Tailwind CSS
- **Package Manager**: npm with workspaces

---

## Directory Quick Map

```
backend/api/src/
├── main.ts                    # Entry point - bootstrap, CORS, validation pipes
├── app/app.module.ts         # Root module - imports all features
├── auth/                      # Authentication
│   ├── auth.controller.ts     # POST /register, /login
│   ├── auth.service.ts        # validateUser(), login() - JWT generation
│   └── strategies/            # LocalStrategy, JwtStrategy
├── users/                     # User CRUD
│   ├── users.controller.ts    # GET /users, /users/:id, POST, PATCH, DELETE
│   ├── users.service.ts       # CRUD + bcrypt hashing
│   └── entities/user.entity.ts # DB entity with Role relationship
├── roles/                     # Role CRUD
│   ├── roles.controller.ts    # Role endpoints with @Roles('admin')
│   ├── roles.service.ts       # CRUD + seeding
│   └── entities/role.entity.ts # DB entity with permissions JSONB
└── common/                    # Shared utilities
    ├── guards/                # JwtAuthGuard, LocalAuthGuard, RolesGuard
    └── decorators/            # @Roles(), @CurrentUser()

frontend/admin-portal/src/
├── main.tsx                   # React entry point
├── app/app.tsx               # Router with AuthProvider
├── contexts/AuthContext.tsx   # Auth state + localStorage
├── services/api.ts           # Axios + interceptors
├── components/
│   ├── auth/ProtectedRoute.tsx # Route guard component
│   └── layout/DashboardLayout.tsx # Main nav + Outlet
├── pages/
│   ├── auth/LoginPage.tsx
│   ├── dashboard/DashboardPage.tsx
│   ├── users/{List,Form}Page.tsx
│   └── roles/{List,Form,Detail}Page.tsx
└── types/index.ts             # Interfaces (match backend DTOs)
```

---

## Core Patterns

### 1. Authentication (Backend)

```typescript
// 1. Register/Login with password
@Post('login')
@UseGuards(LocalAuthGuard)  // Triggers LocalStrategy
login(@Request() req) {
  return this.authService.login(req.user);
}

// LocalStrategy validates email + password with bcrypt
// AuthService.login() generates JWT with role included
```

### 2. Authorization (Backend)

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)  // Validate JWT, then check roles
export class UsersController {
  @Get()
  @Roles('admin', 'moderator')        // Only these roles allowed
  findAll() { }

  @Get('me')
  getProfile(@CurrentUser() user) { }  // Current user from JWT payload
}
```

### 3. Authentication (Frontend)

```typescript
// AuthContext: stores user + token, provides login/logout
// On mount: restore from localStorage, validate with API
// useAuth() hook: access user/loading/login/logout anywhere

// ProtectedRoute: guards admin-only routes
<ProtectedRoute requireAdmin={true}>
  <DashboardLayout />
</ProtectedRoute>
```

### 4. API Calls (Frontend)

```typescript
// Axios interceptor adds Bearer token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor handles 401 by logging out
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
);
```

---

## Key Files by Function

| Function | Backend File | Frontend File |
|----------|--------------|---------------|
| Start app | main.ts | main.tsx |
| Root config | app/app.module.ts | app/app.tsx |
| User login | auth/auth.service.ts | LoginPage.tsx |
| Store token | N/A | AuthContext.tsx |
| Add token to requests | N/A | api.ts |
| Protect routes (server) | guards/jwt-auth.guard.ts | N/A |
| Protect routes (client) | N/A | ProtectedRoute.tsx |
| Check user role | guards/roles.guard.ts | AuthContext.tsx |
| User CRUD | users/ module | UsersListPage, UserFormPage |
| Role CRUD | roles/ module | RolesListPage, RoleFormPage |
| DB schema | entities/ | (types/index.ts) |

---

## Authentication Flow Summary

### Backend
```
register/login request
    ↓
LocalStrategy (email + password via bcrypt)
    ↓
AuthService.login() generates JWT
    ↓
Response: { access_token, user }

Protected request with Bearer token
    ↓
JwtAuthGuard verifies signature
    ↓
JwtStrategy loads full user from DB (with eager-loaded role)
    ↓
RolesGuard checks @Roles decorator
    ↓
req.user available in controller
```

### Frontend
```
User fills login form
    ↓
authApi.login() POST /auth/login
    ↓
Response: { access_token, user }
    ↓
AuthContext stores in localStorage
    ↓
setUser(response.user)

Protected request
    ↓
axios interceptor adds Bearer token
    ↓
401? localStorage.removeItem, redirect /login
    ↓
useAuth() provides user data to components
```

---

## Entity Relationships

```
Role (1) ----< (Many) User

Role:
  - id: UUID (PK)
  - name: string (unique) - 'admin', 'moderator', 'user'
  - permissions: JSONB - { '*': true } or { 'users:read': true }
  - isSystem: boolean - can't delete if true

User:
  - id: UUID (PK)
  - email: string (unique)
  - password: string (bcrypt hashed, @Exclude())
  - role: Role (@ManyToOne eager: true)
  - isActive: boolean
```

---

## Default Roles

| Role | Permissions | Use Case |
|------|-------------|----------|
| admin | `{ '*': true }` | Full system access |
| moderator | `{ 'users:read': true, 'users:list': true }` | View users |
| user | `{ 'users:read:own': true }` | Own profile only |

---

## Environment Variables

### .env (Backend)
```env
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

### Frontend (via Vite)
```env
VITE_API_URL=http://localhost:3000/api
```

---

## Common Commands

```bash
# From root
npm install                 # Install all deps
npm run dev               # API + frontend together
npm run api:serve         # Backend only
npm run admin:serve       # Frontend only
npm run db:up            # Start PostgreSQL
npm run db:down          # Stop PostgreSQL

# From backend
npm run start:dev         # NestJS watch mode
npm run test             # Unit tests
npm run build            # Build for prod

# From frontend
npm run dev              # Vite dev server
npm run build            # Build for prod
npm run preview          # Preview prod build
```

---

## Code Examples

### Add New Protected Route (Backend)

```typescript
@Controller('resources')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResourcesController {
  @Get()
  @Roles('admin')
  findAll(@CurrentUser() user: User) {
    // user is from JWT payload + DB lookup
    return this.resourcesService.findAll();
  }
}
```

### Add New API Call (Frontend)

```typescript
// In api.ts
export const resourcesApi = {
  getAll: async (): Promise<Resource[]> => {
    const { data } = await api.get<Resource[]>('/resources');
    return data;
  },
};

// In component
const ResourcesPage: React.FC = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    resourcesApi.getAll().then(setResources);
  }, []);

  return <div>{resources.map(r => <div key={r.id}>{r.name}</div>)}</div>;
};
```

### Create Role with Permissions (Backend)

```typescript
// Seeding or API
const role = await rolesService.create({
  name: 'editor',
  description: 'Can edit content',
  permissions: {
    'content:read': true,
    'content:write': true,
    'content:delete': false,
  },
});

// Check in guard
if (user.role.permissions['content:write']) {
  // Allow write operation
}
```

---

## Testing User Flow

1. **Start services**
   ```bash
   npm run db:up
   npm run dev
   ```

2. **Register first user**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@test.com","firstName":"Admin","lastName":"User","password":"pass123"}'
   ```

3. **Make admin via Adminer**
   - Visit http://localhost:8080
   - Update user role to 'admin' ID via SQL or UI

4. **Login in frontend**
   - Visit http://localhost:4200
   - Enter credentials
   - Access admin portal

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Token expired or invalid. Check localStorage, re-login |
| CORS error | Backend CORS not enabled. Check `app.enableCors()` in main.ts |
| Role check failing | Ensure user has role object. RolesGuard requires `user.role` |
| Password mismatch | bcrypt.compare() is case-sensitive. Verify plain password |
| DB connection failed | Check .env vars, ensure Postgres is running `npm run db:up` |
| Types mismatch | Frontend types must match backend DTOs. Check types/index.ts |

---

## Performance Tips

1. **JWT eager loading**: User.role is eager-loaded, no extra DB queries
2. **Token in localStorage**: Avoids cookies, good for SPA
3. **Response interceptor**: Centralized 401 handling
4. **System roles**: Protected from deletion/modification
5. **Validation pipes**: DTO validation before service calls
6. **ClassSerializerInterceptor**: Excludes fields like password from responses

---

## Security Checklist

- [x] Passwords bcrypt hashed (10 rounds)
- [x] JWT secret in .env (not committed)
- [x] CORS enabled for frontend origin
- [x] 401 logout + redirect on token expiration
- [x] Password excluded from serialization (@Exclude())
- [x] DTOs validate input (class-validator)
- [x] Admin-only routes protected
- [x] User can't change own role (filterout in controller)
- [ ] Add HTTPS in production
- [ ] Rotate JWT secret periodically
- [ ] Use strong JWT secret (32+ chars)
- [ ] Add password reset flow
- [ ] Rate limit auth endpoints
- [ ] Add audit logging

