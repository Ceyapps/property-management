# RBAC Base - Admin Portal

A React-based admin portal for managing users with role-based access control. Built with React, TypeScript, and Tailwind CSS.

## Features

- **Admin-Only Access**: Only users with the `admin` role can access the portal
- **JWT Authentication**: Secure login with token-based authentication
- **User Management**: Complete CRUD operations for users
  - View all users in a responsive table
  - Create new users with role assignment
  - Edit existing user information
  - Delete users with confirmation
  - Toggle user active status
- **Role Management**: Assign roles (Admin, Moderator, User)
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **Protected Routes**: All routes secured with authentication

## Technology Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool and dev server

## Quick Start

### Prerequisites

- Node.js 20.x or higher
- Backend API running (see backend README)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env` and update if needed:
   ```bash
   cp .env.example .env
   ```

   Environment variable:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

3. **Ensure backend API is running:**
   The admin portal requires the backend API to be accessible.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The admin portal will be available at `http://localhost:4200`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Lint code with ESLint

## Getting Started

### Creating Your First Admin User

Since only admins can access the portal, you need to create your first admin user:

1. **Register a user via the backend API:**
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

2. **Promote to admin in the database:**
   - Access Adminer at `http://localhost:8080`
   - Login credentials:
     - System: PostgreSQL
     - Server: postgres
     - Username: rbacuser
     - Password: rbacpassword
     - Database: rbacbase
   - Navigate to the `users` table
   - Find your user and change the `role` column to `admin`

3. **Login to the admin portal:**
   - Navigate to `http://localhost:4200`
   - Login with your admin credentials
   - Start managing users!

## Application Features

### Authentication
- Secure login page
- JWT token storage in localStorage
- Automatic token validation
- Auto-redirect to login on unauthorized access
- Logout functionality

### User Management

**Users List**
- View all users in a sortable table
- User information displayed:
  - Name (First + Last)
  - Email address
  - Role (with color-coded badges)
  - Status (Active/Inactive)
- Quick actions:
  - Edit user (redirects to edit form)
  - Delete user (two-step confirmation)

**Create User**
- Add new users via form
- Required fields:
  - First Name
  - Last Name
  - Email
  - Password
- Optional fields:
  - Role (Admin, Moderator, User)
- Input validation
- Error handling

**Edit User**
- Update user information
- Change user roles
- Update password (optional)
- Toggle active status
- Pre-filled form with current data

**Delete User**
- Two-step confirmation process
- Prevents accidental deletions
- Instant UI update on success

### Dashboard
- Welcome screen with user info
- Quick access to features
- User role display
- Navigation cards

## Project Structure

```
frontend/
├── admin-portal/
│   ├── src/
│   │   ├── app/
│   │   │   └── app.tsx              # Main app with routing
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.tsx   # Route protection
│   │   │   └── layout/
│   │   │       └── DashboardLayout.tsx  # Main layout
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx      # Authentication state
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   └── LoginPage.tsx    # Login page
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardPage.tsx    # Dashboard home
│   │   │   └── users/
│   │   │       ├── UsersListPage.tsx    # Users table
│   │   │       └── UserFormPage.tsx     # Create/Edit form
│   │   ├── services/
│   │   │   └── api.ts               # API client
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript types
│   │   ├── main.tsx                 # Application entry
│   │   └── styles.css               # Global styles
│   ├── index.html                   # HTML template
│   ├── vite.config.ts               # Vite configuration
│   ├── tsconfig.json                # TypeScript config
│   └── postcss.config.js            # PostCSS config
├── .env                             # Environment variables
├── .env.example                     # Environment template
└── package.json                     # Dependencies and scripts
```

## API Integration

The admin portal communicates with the backend API:

### Endpoints Used

- `POST /api/auth/login` - User login
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/me` - Get current user
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

All authenticated requests include the JWT token in the `Authorization` header.

## Styling

This project uses **Tailwind CSS v4** for styling:

- Utility-first CSS framework
- Responsive design utilities
- Custom color scheme
- Component styling via utility classes

### Customization

Tailwind CSS is imported via PostCSS. The configuration is minimal for v4:

```css
@import "tailwindcss";
```

Add custom styles in `src/styles.css` below the import.

## Building for Production

```bash
# Build the application
npm run build

# Preview the build
npm run preview
```

The build output will be in the `dist/` directory.

## Deployment

### Static Hosting

The admin portal is a static SPA that can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any static hosting service

### Environment Variables

Update `VITE_API_URL` to point to your production API:

```
VITE_API_URL=https://api.yourproduction.com/api
```

### Build Steps

1. Update `.env` with production API URL
2. Run `npm run build`
3. Deploy the `dist/` folder to your hosting provider
4. Configure your hosting for SPA routing (redirect all routes to `index.html`)

### SPA Routing Configuration

Since this is a single-page application, configure your hosting to redirect all routes to `index.html`:

**Vercel** - Create `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Netlify** - Create `_redirects` in public folder:
```
/*  /index.html  200
```

**Nginx**:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Development Tips

### Adding New Features

1. **New Pages**: Add components in `src/pages/`
2. **New Routes**: Update `src/app/app.tsx`
3. **API Endpoints**: Add methods in `src/services/api.ts`
4. **Types**: Define in `src/types/index.ts`

### Code Organization

- Keep components small and focused
- Use TypeScript for type safety
- Follow React best practices
- Use context for global state (Auth)
- Keep API logic in services layer

## Security

- **Admin-only Access**: Routes protected with role checking
- **JWT Authentication**: Secure token-based auth
- **Token Storage**: localStorage (consider httpOnly cookies for enhanced security)
- **Auto Logout**: Automatic logout on token expiration
- **Protected Routes**: All routes require authentication
- **HTTPS**: Always use HTTPS in production

## Troubleshooting

### Cannot Login
- Ensure backend API is running
- Check `VITE_API_URL` in `.env`
- Verify user has `admin` role in database
- Check browser console for errors

### Build Errors
- Clear `node_modules` and reinstall
- Check Node.js version (20.x required)
- Verify all dependencies are installed

### Styling Issues
- Ensure PostCSS and Tailwind are properly configured
- Check `postcss.config.js` includes `@tailwindcss/postcss`
- Clear cache and rebuild

## License

MIT
