#!/bin/bash
set -e

# Create user and set up permissions in a single block
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname sandbox <<-EOSQL
    -- Create user with connection privileges
    CREATE USER sandbox_user WITH PASSWORD 'sandbox_password';
    GRANT CONNECT ON DATABASE sandbox TO sandbox_user;
    
    -- Grant schema usage
    GRANT USAGE ON SCHEMA public TO sandbox_user;
    
    -- Grant permissions on existing tables and sequences
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sandbox_user;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO sandbox_user;
    
    -- Set permissions for future tables and sequences
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sandbox_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO sandbox_user;
EOSQL
