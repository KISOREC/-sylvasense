# API contracts

API prefix: `/api/v1`.

## Response envelope

Successful responses use:

```json
{
  "data": {},
  "message": null,
  "request_id": null
}
```

`data` is endpoint-specific. `message` and `request_id` are optional and nullable. Errors use FastAPI's standard error response until a shared error contract is adopted.

## Initial endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/health` | Liveness response; does not assert database or worker readiness |
| GET | `/` | API name and OpenAPI docs path |

## Change process

Document endpoint, schema, compatibility, authentication, and error behavior changes here. Do not return AI predictions as verified field observations. A future alert API must include evidence/provenance references and represent confidence, uncertainty, and operational severity separately.
