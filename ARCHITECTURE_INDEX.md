# RBAC Base - Architecture Documentation Index

This directory contains comprehensive architectural documentation for the RBAC Base monorepo. Three documents work together to provide complete coverage from executive overview to detailed implementation.

## Quick Navigation

### For Different Audiences

**Just Getting Started?**
- Start here: `ANALYSIS_SUMMARY.md` (14 KB, 5-10 min read)
- Then read: `ARCHITECTURE_QUICK_REFERENCE.md` (10 KB, 5-10 min read)
- Deep dive: `CLAUDE_ARCHITECTURE.md` (38 KB, 30-45 min read)

**Implementing a Feature?**
1. Check: `ARCHITECTURE_QUICK_REFERENCE.md` → Code Examples section
2. Reference: `CLAUDE_ARCHITECTURE.md` → Relevant pattern section
3. Debug: `ANALYSIS_SUMMARY.md` → Troubleshooting section

**Debugging an Issue?**
1. Check: `ARCHITECTURE_QUICK_REFERENCE.md` → Troubleshooting table
2. Review: `ANALYSIS_SUMMARY.md` → Data Flow Examples
3. Deep dive: `CLAUDE_ARCHITECTURE.md` → Specific pattern details

---

## Document Overview

### 1. CLAUDE_ARCHITECTURE.md
**Type:** Deep technical documentation  
**Size:** 38 KB, 1,393 lines  
**Read Time:** 45 minutes  
**Best For:** Understanding how everything works

**Sections:**
- Project Structure (complete file-by-file breakdown)
- Monorepo Architecture (Nx + npm workspaces)
- Backend Architecture (8 subsections)
  - Module structure
  - Authentication flow (3-layer system with detailed code)
  - Authorization & RBAC patterns
  - Database & entities with relationships
  - Bootstrap & configuration
- Frontend Architecture (8 subsections)
  - Technology stack
  - App structure & routing
  - Authentication flow (Context, interceptors, session)
  - Protected routes & access control
  - Pages & components
  - Type definitions
- Cross-app Communication (token flow, request flow)
- Key Architectural Patterns (10 detailed patterns)
- Configuration files & purposes
- Database schema
- Workflow examples

**Use When:**
- Learning the system thoroughly
- Implementing new modules
- Understanding security patterns
- Debugging complex issues
- Adding authentication features

**Key Code Examples:**
- Complete JWT flow with comments
- LocalStrategy implementation
- RolesGuard implementation
- AuthContext with hooks
- Axios interceptor setup
- Protected route wrapper
- Entity relationships

---

### 2. ARCHITECTURE_QUICK_REFERENCE.md
**Type:** Quick lookup guide  
**Size:** 10 KB, 280 lines  
**Read Time:** 10 minutes  
**Best For:** Fast reference while coding

**Sections:**
- Project at a glance (stack summary)
- Directory quick map
- Core patterns (4 core patterns explained)
- Key files by function (2 tables)
- Authentication flow summary (visual flows)
- Entity relationships
- Default roles & permissions table
- Environment variables reference
- Common commands (all useful npm commands)
- Code examples (3 detailed examples)
- Testing user flow (step-by-step)
- Troubleshooting (table of common issues & solutions)
- Performance tips (8 optimization strategies)
- Security checklist (implementation checklist)

**Use When:**
- Need a quick command
- Looking up a file location
- Troubleshooting an issue
- Checking environment variables
- Testing the system
- Implementing common patterns

**Includes:**
- All important commands
- File location references
- Problem-solution pairs
- Code snippets for common tasks
- Testing procedures
- Security verification steps

---

### 3. ANALYSIS_SUMMARY.md
**Type:** Executive summary  
**Size:** 14 KB, 469 lines  
**Read Time:** 20 minutes  
**Best For:** Understanding overall architecture & data flows

**Sections:**
- Documents overview
- High-level architecture overview
  - Stack summary table
  - Architecture type explanation
- Key architectural patterns (6 core patterns explained)
- Critical files & their roles (2 tables)
- Data flow examples (3 detailed flows)
  - User registration flow
  - Protected API request flow
  - Role-based access decision flow
- Default roles & permissions explained
- Security implementation (4 subsections)
- Common development tasks (3 tasks with steps)
- Testing the system (with curl examples)
- Performance characteristics (4 key areas)
- Deployment readiness (3 environments, checklist)
- Troubleshooting & debugging (table)
- File locations summary
- Key takeaways (8 points)
- Next steps for development

**Use When:**
- Onboarding new developers
- Planning new features
- Understanding data flows
- Preparing for deployment
- Debugging unfamiliar patterns
- Writing architecture docs for others

**Key Diagrams:**
- User registration flow
- Protected API request flow
- Role-based access decision
- Default roles & permissions

---

## Architecture at a Glance

### Technology Stack

```
Frontend                Backend              Database
─────────────────────────────────────────────────────
React 19              NestJS               PostgreSQL
TypeScript            Express              TypeORM
Vite                  Passport.js
Tailwind CSS          JWT
React Router          bcrypt
Axios                 class-validator
React Context
```

### Build System
```
Nx Monorepo
├── Root workspace (shared dependencies)
├── backend/ (NestJS app)
└── frontend/ (React app)
```

### Authentication Architecture

```
User → Login Form
    ↓
LocalStrategy (bcrypt password validation)
    ↓
JWT Generation (AuthService)
    ↓
Token + User in Response
    ↓
Frontend localStorage (token + user)
    ↓
Axios Interceptor (add Bearer token)
    ↓
JwtAuthGuard (validate signature + load user)
    ↓
RolesGuard (@Roles metadata check)
    ↓
Controller with @CurrentUser() decorator
```

---

## Key Files Summary

### Backend Essentials
| Purpose | File | Key Function |
|---------|------|--------------|
| Entry Point | `main.ts` | Bootstrap, CORS, validation pipes |
| Root Config | `app/app.module.ts` | Import all features, DB setup |
| Auth Logic | `auth/auth.service.ts` | validateUser(), login() |
| Strategies | `auth/strategies/` | LocalStrategy, JwtStrategy |
| User CRUD | `users/users.service.ts` | create(), update(), findByEmail() |
| User Model | `users/entities/user.entity.ts` | DB schema, role relationship |
| Role CRUD | `roles/roles.service.ts` | create(), update(), seedDefaultRoles() |
| Role Model | `roles/entities/role.entity.ts` | DB schema, JSONB permissions |
| Auth Guard | `common/guards/jwt-auth.guard.ts` | Protect routes with JWT |
| RBAC Guard | `common/guards/roles.guard.ts` | Check @Roles decorator |

### Frontend Essentials
| Purpose | File | Key Function |
|---------|------|--------------|
| Entry Point | `main.tsx` | React rendering |
| Root Config | `app/app.tsx` | Router, AuthProvider |
| Auth State | `contexts/AuthContext.tsx` | useAuth(), login/logout |
| HTTP Client | `services/api.ts` | Axios + interceptors |
| Route Guard | `components/auth/ProtectedRoute.tsx` | Check authentication |
| Main Layout | `components/layout/DashboardLayout.tsx` | Navbar, Outlet |
| Types | `types/index.ts` | TypeScript interfaces |

---

## How to Read These Documents

### Option 1: Quick Learner (30 minutes)
1. Read this index (5 min)
2. Skim ANALYSIS_SUMMARY.md (10 min)
3. Review ARCHITECTURE_QUICK_REFERENCE.md core patterns (10 min)
4. Know where to find detailed info

### Option 2: Thorough Learner (2 hours)
1. Read this index (5 min)
2. Full read: ANALYSIS_SUMMARY.md (20 min)
3. Full read: ARCHITECTURE_QUICK_REFERENCE.md (20 min)
4. Section read: CLAUDE_ARCHITECTURE.md (70 min)
   - Focus on relevant sections for your role

### Option 3: Reference User (on-demand)
1. ARCHITECTURE_QUICK_REFERENCE.md for quick answers
2. CLAUDE_ARCHITECTURE.md for detailed patterns
3. ANALYSIS_SUMMARY.md for data flows & debugging

---

## Common Scenarios

### "I need to add a new API endpoint"
1. Quick Ref → "Code Examples" → "Add New Protected Route"
2. CLAUDE Arch → "Backend Architecture" → "Example Controller"
3. Summary → "Data flow examples"

### "I'm debugging a 401 error"
1. Quick Ref → "Troubleshooting" table
2. CLAUDE Arch → "Token Validation" section
3. Summary → "Security Implementation"

### "I need to understand the whole system"
1. Read Summary → "Architecture at a Glance" (this document)
2. Read full ANALYSIS_SUMMARY.md
3. Read full ARCHITECTURE_QUICK_REFERENCE.md
4. Read relevant CLAUDE_ARCHITECTURE.md sections

### "I'm deploying to production"
1. Summary → "Deployment Readiness" section
2. Summary → "Security Implementation" section
3. Quick Ref → "Security Checklist"
4. CLAUDE Arch → "Configuration" section

### "I need to explain this to someone else"
1. Send them ANALYSIS_SUMMARY.md (executive overview)
2. Follow with ARCHITECTURE_QUICK_REFERENCE.md (practical guide)
3. Have CLAUDE_ARCHITECTURE.md available for questions

---

## Key Architectural Concepts

### Monorepo Structure
- **Root**: Contains shared dependencies (package.json)
- **Backend**: NestJS app with own package.json
- **Frontend**: React app with own package.json
- **Benefit**: Unified commands (`npm run dev`), shared code, parallel builds

### Authentication (3-Layer)
1. **LocalStrategy**: Validates email + password with bcrypt
2. **AuthService**: Generates JWT token with role included
3. **JwtStrategy**: Validates token signature + loads user from DB

### Authorization (Decorator-Based)
- `@UseGuards(JwtAuthGuard, RolesGuard)` at controller level
- `@Roles('admin')` at method level
- RolesGuard checks role name OR wildcard permission

### Frontend State Management
- AuthContext stores global auth state
- useAuth() hook for component access
- localStorage for persistence
- Axios interceptors for automatic token handling

### Database Design
- User has ManyToOne relationship to Role
- Role.role eagerly loaded (always available)
- Permissions stored as JSONB in Role
- System roles protected with isSystem flag

---

## File Locations (Ready to Copy)

### Documentation Files
```
/Users/ad-015/aiprojects/rbacbase/CLAUDE_ARCHITECTURE.md
/Users/ad-015/aiprojects/rbacbase/ARCHITECTURE_QUICK_REFERENCE.md
/Users/ad-015/aiprojects/rbacbase/ANALYSIS_SUMMARY.md
/Users/ad-015/aiprojects/rbacbase/ARCHITECTURE_INDEX.md
```

### Backend Key Files
```
/Users/ad-015/aiprojects/rbacbase/backend/api/src/main.ts
/Users/ad-015/aiprojects/rbacbase/backend/api/src/app/app.module.ts
/Users/ad-015/aiprojects/rbacbase/backend/api/src/auth/auth.service.ts
/Users/ad-015/aiprojects/rbacbase/backend/api/src/auth/strategies/jwt.strategy.ts
/Users/ad-015/aiprojects/rbacbase/backend/api/src/users/users.service.ts
/Users/ad-015/aiprojects/rbacbase/backend/api/src/roles/roles.service.ts
/Users/ad-015/aiprojects/rbacbase/backend/api/src/common/guards/roles.guard.ts
```

### Frontend Key Files
```
/Users/ad-015/aiprojects/rbacbase/frontend/admin-portal/src/main.tsx
/Users/ad-015/aiprojects/rbacbase/frontend/admin-portal/src/app/app.tsx
/Users/ad-015/aiprojects/rbacbase/frontend/admin-portal/src/contexts/AuthContext.tsx
/Users/ad-015/aiprojects/rbacbase/frontend/admin-portal/src/services/api.ts
/Users/ad-015/aiprojects/rbacbase/frontend/admin-portal/src/types/index.ts
```

---

## Summary Statistics

- **Total Documentation**: 2,253 lines across 3 files
- **Total Size**: 62 KB
- **Backend Files Analyzed**: 28 TypeScript files
- **Frontend Files Analyzed**: 16 TypeScript files
- **Configuration Files**: 6 files
- **Code Examples**: 15+ detailed examples
- **Data Flow Diagrams**: 3 detailed flows
- **Troubleshooting Entries**: 10+ solutions
- **Commands Reference**: 20+ npm commands

---

## Document Maintenance

These documents are:
- Architecture-focused (not implementation-focused)
- Pattern-based (showing how things work together)
- Code-example heavy (real code from the project)
- Cross-app view (showing both backend + frontend)
- Up-to-date as of: November 17, 2025

If you modify the architecture significantly:
1. Update CLAUDE_ARCHITECTURE.md with detailed changes
2. Update ARCHITECTURE_QUICK_REFERENCE.md with command/quick ref changes
3. Update ANALYSIS_SUMMARY.md with data flow changes
4. Update this index with new sections

---

## Quick Links by Use Case

| Need | Document | Section |
|------|----------|---------|
| High-level overview | ANALYSIS_SUMMARY | Architecture Overview |
| Quick reference | ARCHITECTURE_QUICK_REFERENCE | Core Patterns |
| Deep dive | CLAUDE_ARCHITECTURE | Backend/Frontend Architecture |
| Commands | ARCHITECTURE_QUICK_REFERENCE | Common Commands |
| Code examples | CLAUDE_ARCHITECTURE | Throughout |
| Troubleshooting | ARCHITECTURE_QUICK_REFERENCE | Troubleshooting |
| Security | ANALYSIS_SUMMARY | Security Implementation |
| Deployment | ANALYSIS_SUMMARY | Deployment Readiness |
| Data flows | ANALYSIS_SUMMARY | Data Flow Examples |
| Database | CLAUDE_ARCHITECTURE | Database & Entities |
| Testing | ARCHITECTURE_QUICK_REFERENCE | Testing User Flow |

---

**Last Updated:** November 17, 2025  
**Analyst:** Claude Code Architecture Analysis
