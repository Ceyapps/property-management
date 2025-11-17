-- Initial database setup for RBAC Base
-- This script will be executed when the PostgreSQL container is first created

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The tables will be automatically created by TypeORM synchronization
-- This file is here for any additional database setup if needed
