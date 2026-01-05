-- GymHub Database Initialization Script
-- This script runs when PostgreSQL container starts for the first time

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For faster text search

-- Set timezone
SET timezone = 'Europe/Belgrade';

-- Create custom types (if needed)
-- Example: CREATE TYPE user_role AS ENUM ('ADMIN', 'EMPLOYEE', 'MEMBER');

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'GymHub database initialized successfully';
    RAISE NOTICE 'Database: gymhub_db';
    RAISE NOTICE 'Timezone: Europe/Belgrade';
END $$;