# Reusable LLM implementation prompt

Use this prompt when asking an LLM to extend or rebuild the frontend:

```text
Act as a senior frontend engineer and technical lead.

Repository:
- Backend: SSE_Application_Development (Spring Boot)
- Frontend: SSE_Application_Development-Front-End
- Assessment: SSE_Application_Development/AI-Aid/
  GovTech_SSE_Backend_Assessment_Candidates.pdf

Goal:
Build a modern, responsive, accessible React JavaScript frontend for every
usable backend workflow. The UI should be suitable for a general government
service portal and must support CITIZEN, SERVICE_AGENT, and ADMIN roles.

Required process:
1. Read the assessment, backend controllers, DTOs, enums, security configuration,
   README, OpenAPI/Postman assets, and existing frontend before changing files.
2. Do not invent endpoints, fields, enum values, roles, or authorization rules.
3. List any material ambiguity and ask before making a product-changing assumption.
4. Produce/update TODO.md with phases, acceptance criteria, dependencies, and
   explicit backend blockers.
5. Keep API calls in a centralized client. Handle the backend success/error
   envelopes, JWT authorization, 401 expiry, loading, empty, and error states.
6. Build role-based workflows rather than a generic API console.
7. Use semantic HTML, keyboard-accessible controls, responsive layouts, clear
   focus states, and accessible labels. Target WCAG 2.2 AA.
8. Never rely on frontend role checks for security; backend authorization remains
   authoritative.
9. Add or update unit tests for changed logic.
10. Run lint, tests, and production build. Fix failures before reporting completion.
11. Update README.md, API mapping, architecture notes, environment variables, and
    exact startup instructions for every change.

Technical constraints:
- React JavaScript with Vite
- React Router for routing
- Avoid unnecessary dependencies and global state
- Never hard-code credentials, tokens, backend origins, citizen IDs, or request IDs
- Preserve existing user changes

Output:
- Start with the implemented outcome.
- List changed files and verification results.
- Clearly separate completed work from backend-dependent follow-up work.
```

## Recommended incremental prompts

1. “Inspect only and update the API matrix and TODO; do not implement yet.”
2. “Implement Phase N from TODO.md and update documentation.”
3. “Run an accessibility and responsive-layout review; fix confirmed issues.”
4. “Run tests/build and resolve failures without changing backend contracts.”

