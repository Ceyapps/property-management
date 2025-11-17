# Admin Portal

A React-based admin portal for managing users with role-based access control.

## Features

- **Admin-Only Access**: Only users with the `admin` role can access the portal
- **User Authentication**: JWT-based login system
- **User Management**: Full CRUD operations for users
  - View all users in a table
  - Create new users with role assignment
  - Edit existing users
  - Delete users with confirmation
  - Toggle user active status
- **Role Management**: Assign roles (Admin, Moderator, User)
- **Responsive Design**: Built with Tailwind CSS for mobile-friendly UI

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Axios** - API communication
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Getting Started

### Prerequisites

1. Ensure the API server is running (`npm run api:serve`)
2. Ensure the database is running (`npm run db:up`)
3. Create at least one admin user (see below)

### Running the Application

```bash
# Development mode
npm run admin:serve

# Build for production
npm run admin:build
```

The admin portal will be available at `http://localhost:4200`

### Creating Your First Admin User

Since only admins can access the portal, you need to create your first admin user:

1. **Via API Registration** (creates user with default role):
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

2. **Promote to Admin in Database**:
   - Access Adminer at `http://localhost:8080`
   - Login with database credentials (see root README.md)
   - Navigate to the `users` table
   - Find your user and edit the `role` column to `admin`

3. **Login to Admin Portal**:
   - Navigate to `http://localhost:4200`
   - Use your admin credentials to login

## Application Structure

```
src/
├── app/                    # Main app component with routing
├── components/
│   ├── auth/              # Authentication components
│   │   └── ProtectedRoute.tsx
│   └── layout/            # Layout components
│       └── DashboardLayout.tsx
├── contexts/
│   └── AuthContext.tsx    # Authentication state management
├── pages/
│   ├── auth/
│   │   └── LoginPage.tsx  # Login page
│   ├── dashboard/
│   │   └── DashboardPage.tsx  # Dashboard home
│   └── users/
│       ├── UsersListPage.tsx  # Users table
│       └── UserFormPage.tsx   # Create/Edit user form
├── services/
│   └── api.ts             # API client and endpoints
└── types/
    └── index.ts           # TypeScript types
```

## Features Overview

### Authentication
- Login form with email and password
- JWT token storage in localStorage
- Automatic token validation
- Auto-redirect to login on unauthorized access

### User Management
- **List Users**: View all users with role and status badges
- **Create User**: Form with validation for all user fields
- **Edit User**: Update user information and roles
- **Delete User**: Two-step confirmation for safety
- **Role Assignment**: Admin, Moderator, or User roles
- **Status Toggle**: Activate/deactivate users

### Access Control
- All routes protected and require admin role
- Non-admin users see access denied message
- Automatic logout on token expiration

## Environment Variables

Configure in `.env`:

```
VITE_API_URL=http://localhost:3000/api
```

## API Integration

The admin portal communicates with the NestJS API:

- `POST /api/auth/login` - User login
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

All API requests (except login) include the JWT token in the Authorization header.

## Development

### Adding New Features

1. **New Pages**: Add to `src/pages/`
2. **New Routes**: Update `src/app/app.tsx`
3. **API Endpoints**: Add to `src/services/api.ts`
4. **Types**: Define in `src/types/index.ts`

### Styling

This project uses Tailwind CSS. Customize in:
- `tailwind.config.js` - Tailwind configuration
- `src/styles.css` - Global styles

## Security

- JWT tokens stored in localStorage
- Admin-only route protection
- Auto-logout on token expiration
- Password fields never displayed (edit mode)
- CORS enabled on API server
