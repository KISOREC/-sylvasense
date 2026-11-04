# Deployment notes

The compose file is for local development and is not production-hardened. Production requires managed secret storage, TLS, restricted network access, non-default passwords, backups/restore tests, monitoring, resource limits, authentication/authorization, and deployment-specific migration procedures.

Build and run the local API/database/cache using `docker compose up --build`. Run Alembic migrations explicitly after reviewing them; the scaffold does not automatically modify the database schema on startup.

Earth Engine requires an enabled project and credentials supplied outside source control. Configure Google Maps browser API key restrictions for approved origins before deployment.
