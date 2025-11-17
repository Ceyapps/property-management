# RBAC Base - Architecture Documentation

## Overview

RBAC Base is a complete Role-Based Access Control system implemented as an **Nx monorepo** with:
- **Backend**: NestJS REST API with JWT authentication, PostgreSQL, and TypeORM
- **Frontend**: React 19 admin portal with TypeScript, Vite, and Tailwind CSS
- **Database**: PostgreSQL with TypeORM ORM

This document provides a deep understanding of how the pieces fit together, key architectural patterns, and how to navigate the codebase.

---

## Project Structure

```
rbacbase/
├── backend/                          # NestJS backend workspace
│   ├── api/src/                     # API source code
│   │   ├── main.ts                  # NestJS bootstrap
│   │   ├── app/
│   │   │   ├── app.module.ts       # Root module - DB & feature imports
│   │   │   ├── app.controller.ts   # Root health check controller
│   │   │   └── app.service.ts
│   │   ├── auth/                    # Authentication module
│   │   │   ├── auth.module.ts      # Imports JWT & Passport modules
│   │   │   ├── auth.controller.ts  # /auth endpoints
│   │   │   ├── auth.service.ts     # Auth logic (validate, login)
│   │   │   └── strategies/          # Passport strategies
│   │   │       ├── jwt.strategy.ts # JWT validation
│   │   │       └── local.strategy.ts # Email/password validation
│   │   ├── users/                   # Users module
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts # /users endpoints
│   │   │   ├── users.service.ts    # User CRUD & bcrypt hashing
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts  # User DB entity
│   │   │   └── dto/                 # Data transfer objects
│   │   │       ├── create-user.dto.ts
│   │   │       ├── login.dto.ts
│   │   │       └── update-user.dto.ts
│   │   ├── roles/                   # Roles module
│   │   │   ├── roles.module.ts
│   │   │   ├── roles.controller.ts # /roles endpoints
│   │   │   ├── roles.service.ts    # Role CRUD & seeding
│   │   │   ├── entities/
│   │   │   │   └── role.entity.ts  # Role DB entity
│   │   │   └── dto/
│   │   │       ├── create-role.dto.ts
│   │   │       └── update-role.dto.ts
│   │   └── common/                  # Shared auth utilities
│   │       ├── guards/              # Authentication guards
│   │       │   ├── jwt-auth.guard.ts # Protects JWT routes
│   │       │   ├── local-auth.guard.ts # For login
│   │       │   └── roles.guard.ts   # Authorization (RBAC)
│   │       ├── decorators/
│   │       │   ├── roles.decorator.ts # @Roles decorator
│   │       │   └── current-user.decorator.ts # @CurrentUser
│   │       └── enums/
│   │           └── role.enum.ts     # Role name enum
│   ├── api-e2e/                    # E2E tests
│   ├── package.json                # Backend dependencies
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── docker-compose.yml          # Local database setup
│   ├── init-db.sql                 # Database initialization
│   └── README.md
│
├── frontend/                        # React frontend workspace
│   ├── admin-portal/src/
│   │   ├── main.tsx               # React entry point
│   │   ├── app/
│   │   │   ├── app.tsx           # Root router with AuthProvider
│   │   │   └── nx-welcome.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx    # Auth state & token management
│   │   ├── services/
│   │   │   └── api.ts            # Axios interceptors & API clients
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.tsx # Route access control
│   │   │   └── layout/
│   │   │       └── DashboardLayout.tsx # Main nav & layout
│   │   ├── pages/                 # Route pages
│   │   │   ├── auth/
│   │   │   │   └── LoginPage.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardPage.tsx
│   │   │   ├── users/
│   │   │   │   ├── UsersListPage.tsx
│   │   │   │   └── UserFormPage.tsx
│   │   │   └── roles/
│   │   │       ├── RolesListPage.tsx
│   │   │       ├── RoleFormPage.tsx
│   │   │       └── RoleDetailPage.tsx
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript interfaces
│   │   └── vite-env.d.ts
│   ├── vite.config.ts            # Vite configuration
│   ├── tsconfig.json
│   ├── package.json
│   └── README.md
│
├── .env                           # Root environment variables
├── .env.example
├── docker-compose.yml            # Postgres + Adminer for dev
├── package.json                  # Workspace root commands
├── tsconfig.json
└── README.md
```

---

## Monorepo Architecture (Nx)

This project uses **Nx with npm workspaces** for a unified monorepo:

### Key Characteristics:

1. **Shared Dependencies**: Root `package.json` contains common packages installed once
2. **Workspace Packages**: Backend and frontend have their own `package.json` files
3. **Parallel Execution**: `npm run dev` runs both API and frontend simultaneously
4. **Task Caching**: Nx caches build outputs for faster rebuilds
5. **Unified Commands**: Manage both apps from the root directory

### Root Commands (from `package.json`):
```bash
npm run dev              # Run API + frontend in parallel
npm run api:serve       # Backend only
npm run admin:serve     # Frontend only
npm run api:build       # Build backend for production
npm run admin:build     # Build frontend for production
npm run db:up          # Start PostgreSQL + Adminer
npm run db:down        # Stop database
```

---

## Backend Architecture

### Technology Stack

- **NestJS**: Progressive Node.js framework with dependency injection
- **TypeORM**: Database ORM with entity decorators
- **PostgreSQL**: Relational database
- **Passport.js**: Authentication middleware
- **JWT**: JSON Web Tokens for stateless auth
- **bcrypt**: Password hashing

### Module Structure

The backend follows **NestJS modular architecture** with feature modules:

#### AppModule (Root)
**File**: `/backend/api/src/app/app.module.ts`

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ /* database config */ }),
    RolesModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Key Pattern**: Global configuration + feature module imports + database setup

---

### Authentication Flow

#### 1. **Registration** (`POST /api/auth/register`)

**File**: `/backend/api/src/auth/auth.controller.ts`

```typescript
@Post('register')
async register(@Body() createUserDto: CreateUserDto) {
  const user = await this.usersService.create(createUserDto);
  return this.authService.login(user);
}
```

**Flow**:
1. Controller accepts `CreateUserDto` (email, firstName, lastName, password)
2. `UsersService.create()` validates & hashes password with bcrypt (10 rounds)
3. User saved to DB (if email doesn't already exist)
4. `AuthService.login()` generates JWT token
5. Returns `{ access_token, user }`

**File**: `/backend/api/src/users/users.service.ts`

```typescript
async create(createUserDto: CreateUserDto): Promise<User> {
  const existingUser = await this.findByEmail(createUserDto.email);
  if (existingUser) throw new ConflictException('...');
  
  const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
  const user = this.usersRepository.create({
    ...createUserDto,
    password: hashedPassword,
  });
  
  return this.usersRepository.save(user);
}
```

---

#### 2. **Login** (`POST /api/auth/login`)

**File**: `/backend/api/src/auth/auth.controller.ts`

```typescript
@UseGuards(LocalAuthGuard)
@Post('login')
@HttpCode(HttpStatus.OK)
async login(@Request() req, @Body() loginDto: LoginDto) {
  return this.authService.login(req.user);
}
```

**Key Pattern**: `@UseGuards(LocalAuthGuard)` triggers Passport Local strategy

**LocalAuthGuard** → **LocalStrategy**:

**File**: `/backend/api/src/auth/strategies/local.strategy.ts`

```typescript
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // Use email instead of username
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return user;
  }
}
```

**AuthService.validateUser()**:

**File**: `/backend/api/src/auth/auth.service.ts`

```typescript
async validateUser(email: string, password: string): Promise<any> {
  const user = await this.usersService.findByEmail(email);
  if (!user) return null;

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return null;

  if (!user.isActive) throw new UnauthorizedException('User account is inactive');

  const { password: _, ...result } = user; // Exclude password
  return result;
}
```

**AuthService.login()**: Generates JWT token

```typescript
async login(user: any) {
  const payload = { email: user.email, sub: user.id, role: user.role };
  return {
    access_token: this.jwtService.sign(payload),
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  };
}
```

**JWT Payload**: `{ email, sub (userId), role }`

---

#### 3. **Token Validation** (Protected Routes)

**File**: `/backend/api/src/common/guards/jwt-auth.guard.ts`

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

**JwtStrategy**:

**File**: `/backend/api/src/auth/strategies/jwt.strategy.ts`

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService, private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Bearer token
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub); // Fetch full user with role
    if (!user || !user.isActive) throw new UnauthorizedException();
    return user; // Attached to req.user
  }
}
```

**Key Pattern**: 
- Extract Bearer token from header
- Verify signature with JWT_SECRET
- Fetch full user from DB (eager loads role)
- Attach user to `request.user`

---

### Authorization (RBAC)

#### Role-Based Access Control Pattern

**File**: `/backend/api/src/common/guards/roles.guard.ts`

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true; // No roles required = public

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) return false;

    // Check if user's role matches any required role OR has wildcard admin permission
    return (
      requiredRoles.some((roleName) => user.role.name === roleName) ||
      user.role.permissions?.['*'] === true
    );
  }
}
```

**Usage with @Roles decorator**:

**File**: `/backend/api/src/common/decorators/roles.decorator.ts`

```typescript
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

**Example Controller**:

**File**: `/backend/api/src/roles/roles.controller.ts`

```typescript
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard) // Always require JWT + role check
export class RolesController {
  @Post()
  @Roles('admin') // Only admin role
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.rolesService.findAll();
  }
}
```

**File**: `/backend/api/src/users/users.controller.ts`

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  @Get()
  @Roles('admin', 'moderator') // Multiple allowed roles
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  getProfile(@CurrentUser() user: User) { // Current user - no role check needed
    return user;
  }

  @Patch(':id')
  @Roles('admin') // Only admin
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch('me/profile')
  updateOwnProfile(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const { roleId, ...allowedUpdates } = updateUserDto; // Prevent users changing their role
    return this.usersService.update(user.id, allowedUpdates);
  }
}
```

**Key Patterns**:
1. `@UseGuards(JwtAuthGuard, RolesGuard)` at controller level
2. `@Roles('admin')` at method level
3. `@CurrentUser()` decorator extracts `req.user` for self-service operations
4. Multiple roles: `@Roles('admin', 'moderator')`
5. No `@Roles` decorator = public endpoint (but JWT still required if guard is active)

---

### Database & Entities

#### Entity Relationships

**File**: `/backend/api/src/users/entities/user.entity.ts`

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @Exclude() // Hides from response
  password: string;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'roleId' })
  role: Role; // Eagerly loaded

  @Column({ nullable: true })
  roleId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**File**: `/backend/api/src/roles/entities/role.entity.ts`

```typescript
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // 'admin', 'moderator', 'user'

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isSystem: boolean; // System roles cannot be deleted

  @Column('jsonb', { default: {} })
  permissions: Record<string, boolean>; // { '*': true } for admin

  @OneToMany(() => User, (user) => user.role)
  users: User[]; // Relation to users

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Key Pattern**: `{ eager: true }` on User.role means role is automatically loaded with user

#### Role Seeding

**File**: `/backend/api/src/roles/roles.service.ts`

```typescript
async seedDefaultRoles(): Promise<void> {
  const defaultRoles = [
    {
      name: 'admin',
      description: 'Full system access',
      isSystem: true,
      permissions: { '*': true }, // Wildcard - admin can do everything
    },
    {
      name: 'moderator',
      description: 'Can view and manage users',
      isSystem: true,
      permissions: { 'users:read': true, 'users:list': true },
    },
    {
      name: 'user',
      description: 'Default user role',
      isSystem: true,
      permissions: { 'users:read:own': true },
    },
  ];

  for (const roleData of defaultRoles) {
    const exists = await this.findByName(roleData.name);
    if (!exists) {
      const role = this.rolesRepository.create(roleData);
      await this.rolesRepository.save(role);
    }
  }
}
```

**Called on bootstrap**:

**File**: `/backend/api/src/main.ts`

```typescript
const rolesService = app.get(RolesService);
await rolesService.seedDefaultRoles();
Logger.log('✓ Default roles seeded');
```

---

### Bootstrap & Configuration

**File**: `/backend/api/src/main.ts`

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix); // All routes prefixed with /api

  // Enable CORS for frontend requests
  app.enableCors();

  // Global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw on unknown properties
      transform: true, // Auto-cast DTO properties
    })
  );

  // Seed default roles
  const rolesService = app.get(RolesService);
  await rolesService.seedDefaultRoles();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
}
```

**Key Patterns**:
- Global prefix `/api` for all routes
- CORS enabled for frontend
- Validation pipes enforce DTO contracts
- Role seeding on startup

---

## Frontend Architecture

### Technology Stack

- **React 19**: Latest UI library with hooks
- **TypeScript**: Type-safe components
- **Vite**: Fast build tool and dev server
- **React Router v7**: Client-side routing
- **Axios**: HTTP client with interceptors
- **Tailwind CSS**: Utility-first styling
- **React Context**: State management for auth

### App Structure

**File**: `/frontend/admin-portal/src/app/app.tsx`

```typescript
export function App() {
  return (
    <BrowserRouter>
      <AuthProvider> {/* Wrap with auth context */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute requireAdmin={true}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Nested routes inside layout */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersListPage />} />
            <Route path="users/new" element={<UserFormPage />} />
            <Route path="users/:id" element={<UserFormPage />} />
            <Route path="roles" element={<RolesListPage />} />
            <Route path="roles/new" element={<RoleFormPage />} />
            <Route path="roles/:id" element={<RoleDetailPage />} />
            <Route path="roles/:id/edit" element={<RoleFormPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

**Key Patterns**:
- BrowserRouter for client-side routing
- AuthProvider wraps entire app for global auth state
- ProtectedRoute guards admin-only areas
- DashboardLayout provides nested routing (Outlet pattern)
- Nested routes render inside DashboardLayout

---

### Authentication Flow (Frontend)

#### AuthContext

**File**: `/frontend/admin-portal/src/contexts/AuthContext.tsx`

```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // Validate token by fetching current user from API
          const currentUser = await usersApi.getCurrentUser();
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = user?.role?.name === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

**Key Patterns**:
1. **Persistent Sessions**: Token & user data stored in localStorage
2. **Token Validation**: On mount, validate token by fetching current user
3. **Custom Hook**: `useAuth()` provides context anywhere in app
4. **Loading State**: Prevents rendering until auth is verified

---

#### API Client with Interceptors

**File**: `/frontend/admin-portal/src/services/api.ts`

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // Force re-login
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  register: async (userData: CreateUserDto): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', userData);
    return data;
  },
};

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  create: async (userData: CreateUserDto): Promise<User> => {
    const { data } = await api.post<User>('/users', userData);
    return data;
  },

  update: async (id: string, userData: UpdateUserDto): Promise<User> => {
    const { data } = await api.patch<User>(`/users/${id}`, userData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get<User>('/users/me');
    return data;
  },
};

// Roles API (similar structure)
export const rolesApi = {
  getAll: async (): Promise<Role[]> => {
    const { data } = await api.get<Role[]>('/roles');
    return data;
  },
  // ... other methods
};
```

**Key Patterns**:
1. **Axios Instance**: Centralized API configuration
2. **Request Interceptor**: Automatically adds Bearer token to all requests
3. **Response Interceptor**: Handles 401 by clearing auth and redirecting to login
4. **Typed API Methods**: Each resource has getAll, getById, create, update, delete
5. **Environment Variable**: `VITE_API_URL` for configurable backend URL

---

#### Protected Route Component

**File**: `/frontend/admin-portal/src/components/auth/ProtectedRoute.tsx`

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
```

**Key Patterns**:
1. **Loading State**: Spinner while auth is being verified
2. **Not Logged In**: Redirect to login
3. **Not Admin**: Show access denied message
4. **Allowed**: Render children

---

#### Dashboard Layout

**File**: `/frontend/admin-portal/src/components/layout/DashboardLayout.tsx`

```typescript
export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <h1 className="text-xl font-bold text-blue-600">Admin Portal</h1>

            {/* Navigation Links */}
            <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
              Dashboard
            </Link>
            <Link to="/users" className={location.pathname.startsWith('/users') ? 'active' : ''}>
              Users
            </Link>
            <Link to="/roles" className={location.pathname.startsWith('/roles') ? 'active' : ''}>
              Roles
            </Link>

            {/* User Info & Logout */}
            <div className="flex items-center">
              <span>{user?.firstName} {user?.lastName}</span>
              <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user?.role?.name}
              </span>
              <button onClick={handleLogout} className="ml-4 px-4 py-2 text-white bg-blue-600 rounded">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content - Outlet renders nested routes */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};
```

**Key Patterns**:
1. **useAuth Hook**: Access user and logout function
2. **useNavigate/useLocation**: React Router hooks for navigation
3. **Outlet Component**: Renders child routes
4. **Active Link Styling**: Uses `isActive()` to highlight current page

---

### Pages

#### Login Page

**File**: `/frontend/admin-portal/src/pages/auth/LoginPage.tsx`

- Form with email/password inputs
- Calls `authApi.login()` on submit
- Stores token and user in localStorage via `AuthContext.login()`
- Navigates to `/dashboard` on success
- Shows error message on failure

#### Dashboard Page

**File**: `/frontend/admin-portal/src/pages/dashboard/DashboardPage.tsx`

- Welcome message
- Summary statistics
- Quick links to users/roles pages

#### Users Pages

**File**: `/frontend/admin-portal/src/pages/users/UsersListPage.tsx`

- Table of all users
- Display: email, name, role, status
- Actions: view, edit, delete

**File**: `/frontend/admin-portal/src/pages/users/UserFormPage.tsx`

- Create new user or edit existing
- Form fields: email, firstName, lastName, password, roleId, isActive
- Calls `usersApi.create()` or `usersApi.update()`
- Redirects to users list on success

#### Roles Pages

**File**: `/frontend/admin-portal/src/pages/roles/RolesListPage.tsx`

- Table of all roles
- Display: name, description, isSystem flag, permissions count
- Actions: view, edit, delete

**File**: `/frontend/admin-portal/src/pages/roles/RoleFormPage.tsx`

- Create or edit role
- Form fields: name, description, permissions (JSON object)
- Calls `rolesApi.create()` or `rolesApi.update()`

**File**: `/frontend/admin-portal/src/pages/roles/RoleDetailPage.tsx`

- View role details
- Display permissions in readable format
- Link to edit or delete

---

### Type Definitions

**File**: `/frontend/admin-portal/src/types/index.ts`

```typescript
export interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  roleId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleId?: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions: Record<string, boolean>;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: Record<string, boolean>;
}
```

**Key Pattern**: Interfaces match backend DTOs and entities for type safety

---

## Cross-App Communication

### Authentication Token Flow

```
Frontend                           Backend
=========                          =======

Login Form
    |
    v
authApi.login(email, password)
    |
    +---> POST /api/auth/login
                |
                v
            LocalAuthGuard
                |
                v
            LocalStrategy.validate()
                |
                v
            AuthService.validateUser()
                | (bcrypt.compare)
                v
            <-- JWT Token + User
    |
    v
localStorage.setItem('token')
localStorage.setItem('user')
```

### Protected Request Flow

```
Frontend                           Backend
=========                          =======

GET /api/users (with token)
    |
    v
api.interceptor.request
    | (adds Authorization: Bearer {token})
    v
                +---> GET /api/users
                        |
                        v
                    JwtAuthGuard
                        |
                        v
                    JwtStrategy.validate()
                        | (verify JWT)
                        v
                        | (fetch full user from DB)
                        v
                    RolesGuard
                        | (check @Roles decorator)
                        v
                    Controller Method
                        |
                        v
                    <-- User Data
    |
    v
api.interceptor.response
    | (checks for 401)
    v
setUser(response.data)
```

---

## Key Architectural Patterns

### 1. **Modular NestJS Architecture**
- Feature modules (Users, Auth, Roles) encapsulate related code
- Global guards and decorators for cross-cutting concerns
- Dependency injection for loose coupling

### 2. **Passport.js Strategies**
- **Local Strategy**: Email/password validation
- **JWT Strategy**: Token validation and user loading
- Guard classes wrap strategies for route protection

### 3. **Guard & Decorator Composition**
- `@UseGuards(JwtAuthGuard, RolesGuard)` at controller level
- `@Roles('admin')` at method level
- `@CurrentUser()` for self-service operations
- Metadata system for role checking

### 4. **Bcrypt Password Hashing**
- 10 rounds of salting
- Passwords excluded from serialization with `@Exclude()`
- Validation on login with `bcrypt.compare()`

### 5. **TypeORM Relationships**
- `@ManyToOne` with `eager: true` for automatic role loading
- `@Exclude()` decorator hides sensitive fields
- Auto-timestamps with `@CreateDateColumn()` / `@UpdateDateColumn()`

### 6. **JWT Payload Structure**
```json
{
  "email": "admin@example.com",
  "sub": "user-uuid",
  "role": { "id": "...", "name": "admin", "permissions": {...} },
  "iat": 1234567890,
  "exp": 1234654290
}
```

### 7. **React Context for State Management**
- `AuthContext` provides global auth state
- `useAuth()` custom hook for component access
- localStorage for persistence across page reloads

### 8. **Axios Interceptors for HTTP**
- Request interceptor adds Bearer token
- Response interceptor handles 401 by clearing auth
- Typed API methods for each resource

### 9. **Route Protection in React**
- `<ProtectedRoute>` wrapper component
- Loading state during auth verification
- Admin-only routes with `requireAdmin` prop

### 10. **Environmental Configuration**
- `.env` files for database, JWT secret, API URL
- ConfigService in NestJS for type-safe config access
- Vite environment variables for frontend API URL

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  firstName VARCHAR NOT NULL,
  lastName VARCHAR NOT NULL,
  password VARCHAR NOT NULL,
  roleId UUID FOREIGN KEY references roles(id),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### Roles Table
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL,
  description VARCHAR,
  isSystem BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT {},
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### Default Roles
- **admin**: `{ '*': true }` - wildcard permission
- **moderator**: `{ 'users:read': true, 'users:list': true }`
- **user**: `{ 'users:read:own': true }`

---

## Configuration Files

### Root `.env`
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

### Backend `nest-cli.json`
```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "api/src"
}
```

### Frontend `vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4200,
  },
});
```

### Root `package.json` Scripts
```json
{
  "scripts": {
    "api:serve": "nx serve api",
    "api:build": "nx build api",
    "admin:serve": "nx serve admin-portal",
    "admin:build": "nx build admin-portal",
    "dev": "nx run-many --target=serve --projects=api,admin-portal --parallel",
    "db:up": "docker-compose up -d",
    "db:down": "docker-compose down",
    "db:logs": "docker-compose logs -f postgres"
  }
}
```

---

## Workflow Examples

### Adding a New Protected Route (Backend)

1. Create controller method
2. Add `@UseGuards(JwtAuthGuard, RolesGuard)` to controller class
3. Add `@Roles('admin')` to method
4. Access user via `@CurrentUser()` decorator
5. Service automatically injected via dependency injection

### Adding a New Admin Page (Frontend)

1. Create page component in `src/pages/`
2. Add route in `app.tsx` nested under `ProtectedRoute`
3. Create API client methods in `api.ts`
4. Use `useAuth()` for user info
5. Use typed interfaces from `types/index.ts`

### Adding a New Role with Custom Permissions

1. In roles seed or via admin UI, create role with permission object
2. Backend RolesGuard checks `user.role.permissions['*']` for admin
3. Custom guards can check specific permissions like `'users:write'`
4. Frontend displays permissions as JSON, can add UI for permission management

---

## Summary of Key Files

| Purpose | Backend | Frontend |
|---------|---------|----------|
| **Bootstrap** | `main.ts` | `main.tsx` |
| **App Root** | `app.module.ts` | `app.tsx` |
| **Authentication** | `auth/` module | `AuthContext.tsx` |
| **HTTP Client** | Typed controllers | `api.ts` with Axios |
| **Authorization** | `jwt-auth.guard.ts`, `roles.guard.ts` | `ProtectedRoute.tsx` |
| **Decorators** | `@Roles`, `@CurrentUser` | `useAuth()` hook |
| **Database Entities** | `user.entity.ts`, `role.entity.ts` | TypeScript interfaces |
| **Type Safety** | DTOs in each module | `types/index.ts` |
| **State Management** | Module dependencies | React Context |
| **Styling** | N/A | Tailwind CSS |
| **Routing** | Express (NestJS) | React Router v7 |

---

## Development Commands Quick Reference

```bash
# Root directory
npm install                    # Install all dependencies
npm run dev                   # Run API + frontend in parallel
npm run api:serve             # Backend only
npm run admin:serve           # Frontend only
npm run db:up                 # Start PostgreSQL + Adminer
npm run db:down               # Stop database

# Or in specific directories
cd backend && npm run start:dev  # Backend with watch
cd frontend && npm run dev       # Frontend dev server
```

---

## Key Takeaways for Developers

1. **Authentication is layered**: Local strategy for login, JWT for protected routes
2. **Authorization is decorator-based**: Use `@Roles()` at method level
3. **Database relationships are eager-loaded**: User always has Role populated
4. **Passwords are bcrypt-hashed**: Never stored in plain text
5. **Frontend persists auth in localStorage**: Restored on page refresh
6. **API calls include Bearer token**: Added automatically by Axios interceptor
7. **401 responses trigger logout**: Interceptor clears storage and redirects
8. **System roles can't be deleted**: Protected by `isSystem` flag
9. **Modules are self-contained**: Each feature module imports what it needs
10. **Type safety spans both apps**: Shared DTOs keep frontend/backend in sync

