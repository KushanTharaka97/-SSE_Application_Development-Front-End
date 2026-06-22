# Frontend architecture

## Design goals

The UI is role-oriented rather than endpoint-oriented. Users see complete work
flows, while endpoint details remain in the API module.

```text
Page / workflow
      ↓
Feature API function
      ↓
Central fetch client (JWT, envelopes, errors)
      ↓
Vite proxy in development
      ↓
Spring Boot backend
```

## Decisions

1. **React JavaScript:** matches the requested technology and keeps the assessment
   accessible. TypeScript is a reasonable production migration.
2. **Vite:** fast, minimal React development/build tool.
3. **Plain CSS:** avoids binding the project to a component framework and makes
   the visual system directly reviewable.
4. **Session storage:** avoids a token persisting after the browser session. It
   remains readable by JavaScript; secure HttpOnly cookies would require a
   backend authentication redesign.
5. **Frontend role gates plus backend enforcement:** frontend gates improve UX,
   but Spring Security remains the authorization authority.
6. **No global state library:** authentication is the only cross-cutting state.
   Server results stay with their feature pages to avoid unnecessary complexity.

## Production topology

Preferred:

```text
Browser → HTTPS reverse proxy
                  ├── /          → React static files
                  └── /api/*     → Spring Boot
```

This keeps the browser on one origin. If frontend/backend use different origins,
configure a strict backend CORS allowlist; do not use a wildcard with credentials
or sensitive APIs.

