# RBAC Base

A Role-Based Access Control (RBAC) system built with NestJS, TypeORM, and PostgreSQL in an Nx monorepo.

## Overview

This project provides a complete authentication and authorization system with:
- JWT-based authentication
- Role-based access control (Admin, Moderator, User)
- User management with CRUD operations
- PostgreSQL database with TypeORM
- Docker Compose setup for easy development
- React admin portal for managing users

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the PostgreSQL database:**
   ```bash
   npm run db:up
   ```

3. **Configure environment variables:**
   Copy `.env.example` to `.env` (already done, but verify settings)

4. **Start the development servers:**

   **Option 1: Run both API and Admin Portal together**
   ```bash
   npm run dev
   ```

   **Option 2: Run separately**
   ```bash
   # Terminal 1 - Start the API
   npm run api:serve

   # Terminal 2 - Start the Admin Portal
   npm run admin:serve
   ```

The API will be available at `http://localhost:3000/api`
The Admin Portal will be available at `http://localhost:4200`

5. **Create your first admin user:**
   - Register a user via API (see API documentation)
   - Promote to admin role in the database (see Database Management section)
   - Login to the admin portal

## Project Structure

```
rbacbase/
├── packages/
│   ├── api/              # NestJS API application
│   │   ├── src/
│   │   │   ├── auth/     # Authentication module
│   │   │   ├── users/    # Users module with CRUD
│   │   │   ├── common/   # Shared decorators, guards, enums
│   │   │   └── app/      # Main application module
│   │   └── README.md     # API documentation
│   ├── admin-portal/     # React admin application
│   │   ├── src/
│   │   │   ├── pages/    # Page components
│   │   │   ├── components/ # Reusable components
│   │   │   ├── contexts/ # React contexts (Auth)
│   │   │   ├── services/ # API services
│   │   │   └── types/    # TypeScript types
│   │   └── README.md     # Admin portal documentation
│   └── api-e2e/          # E2E tests
├── docker-compose.yml    # PostgreSQL + Adminer setup
├── .env                  # Environment variables
└── .env.example          # Environment template
```

## Available Scripts

### Development
- `npm run dev` - Start both API and Admin Portal in parallel
- `npm run api:serve` - Start the API in development mode
- `npm run admin:serve` - Start the Admin Portal in development mode

### Build
- `npm run api:build` - Build the API for production
- `npm run admin:build` - Build the Admin Portal for production

### Database
- `npm run db:up` - Start PostgreSQL database
- `npm run db:down` - Stop PostgreSQL database
- `npm run db:logs` - View database logs

### Testing
- `npm run api:test` - Run API tests

## Features

### Authentication
- User registration with email and password
- Login with JWT tokens
- Password hashing with bcrypt
- Token-based authentication

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

## Applications

### API Server
See [packages/api/README.md](packages/api/README.md) for detailed API documentation including:
- All available endpoints
- Request/response examples
- Role requirements
- Setup instructions

### Admin Portal
See [packages/admin-portal/README.md](packages/admin-portal/README.md) for admin portal documentation including:
- User interface features
- Admin-only access control
- User management workflows
- Development guide

## Database Management

Access Adminer (web-based database UI) at `http://localhost:8080`:
- System: PostgreSQL
- Server: postgres
- Username: rbacuser
- Password: rbacpassword
- Database: rbacbase

## Development with Nx

This is an Nx monorepo. Learn more:

## Generate a library

```sh
npx nx g @nx/js:lib packages/pkg1 --publishable --importPath=@my-org/pkg1
```

## Run tasks

To build the library use:

```sh
npx nx build pkg1
```

To run any task with Nx use:

```sh
npx nx <target> <project-name>
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Versioning and releasing

To version and release the library use

```
npx nx release
```

Pass `--dry-run` to see what would happen without actually releasing the library.

[Learn more about Nx release &raquo;](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Keep TypeScript project references up to date

Nx automatically updates TypeScript [project references](https://www.typescriptlang.org/docs/handbook/project-references.html) in `tsconfig.json` files to ensure they remain accurate based on your project dependencies (`import` or `require` statements). This sync is automatically done when running tasks such as `build` or `typecheck`, which require updated references to function correctly.

To manually trigger the process to sync the project graph dependencies information to the TypeScript project references, run the following command:

```sh
npx nx sync
```

You can enforce that the TypeScript project references are always in the correct state when running in CI by adding a step to your CI job configuration that runs the following command:

```sh
npx nx sync:check
```

[Learn more about nx sync](https://nx.dev/reference/nx-commands#sync)

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

Connecting to Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/js?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
