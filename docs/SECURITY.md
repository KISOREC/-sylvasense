# Security guidance

- Never commit secrets, API keys, credential files, service-account JSON, or sensitive operational data.
- Configure runtime secrets through a managed secret store in deployment and local ignored `.env` files for development.
- Frontend `VITE_*` variables are public browser values; never place private credentials in them.
- Restrict Google Cloud service accounts to the minimum required permissions.
- Before public deployment, design authentication, authorization, rate limiting, CORS, audit logging, backups, and incident response.
- Avoid logging access tokens, credentials, sensitive personal information, or unnecessary exact locations.
- Report suspected vulnerabilities privately to maintainers rather than publishing exploit details.
