# GovConnect Frontend

React frontend for the Government Service Request Platform backend in
`../SSE_Application_Development`. It provides separate, role-aware workspaces
for citizens, service agents, and administrators.

## Implemented features

- Public citizen registration and JWT login
- Session restoration through `GET /api/auth/me`
- Role-based navigation and route protection
- Citizen service-request submission, pagination, detail view, document upload,
  notifications, and mark-as-read workflow
- Service-agent request filters, request processing, document verification, and
  status-history timeline
- Administrator citizen search/create/update/deactivate, staff registration,
  service-request processing/cancellation, and document deletion by ID
- Standard API envelope/error handling, loading states, empty states, and
  responsive layouts

The complete endpoint mapping is in [docs/API-INTEGRATION.md](docs/API-INTEGRATION.md).
Implementation progress and remaining work are in [TODO.md](TODO.md).

## Technology

- React (JavaScript)
- Vite
- React Router
- Lucide React icons
- Plain CSS design system
- Vitest and Testing Library
- ESLint

## Prerequisites

Install:

- Node.js 20 or newer
- npm 10 or newer
- Java 21 and the backend prerequisites documented in
  `../SSE_Application_Development/README.md`

## Start the project step by step

### 1. Start the backend

Open PowerShell in `SSE_Application_Development`, provide the required backend
environment variables, and start Spring Boot:

```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/gsrp_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your-password"
$env:JWT_SECRET="replace-with-a-secret-of-at-least-32-characters"
.\mvnw.cmd spring-boot:run
```

Confirm the backend is healthy:

```text
http://localhost:8080/actuator/health
```

### 2. Install frontend dependencies

Open another PowerShell window:

```powershell
cd D:\working_for_side_projects\gov-assesment\SSE_Application_Development-Front-End
npm install
```

### 3. Configure the frontend

Local development needs no environment file. Vite proxies `/api` and
`/actuator` to `http://localhost:8080`.

For a backend on another origin, copy `.env.example` to `.env.local`:

```powershell
Copy-Item .env.example .env.local
```

Then set:

```dotenv
VITE_API_BASE_URL=https://your-api-host
```

The backend must allow that browser origin through CORS. The current backend
does not configure CORS, so the local Vite proxy is the supported development
setup.

### 4. Start React

```powershell
npm run dev
```

Open `http://localhost:5173`.

### 5. Sign in by role

- Citizen: use public registration, then sign in.
- Service Agent: an administrator creates the account from **Admin tools**.
- Administrator: the first admin must be provisioned using the backend's
  documented bootstrap/out-of-band process.

## Validation commands

```powershell
npm run lint
npm test
npm run build
npm run preview
```

Production output is generated in `dist/`.

## Important backend constraints

- JWT data is stored in `sessionStorage`, not `localStorage`. This reduces
  persistence but does not make browser tokens immune to XSS. A production
  system should evaluate secure, HttpOnly cookies.
- The API has no refresh-token endpoint. Expired/invalid sessions return to the
  login screen.
- An administrator can delete a document only by exact document ID because the
  backend exposes no admin document-list endpoint.
- Service types are currently limited to `GENERAL_INQUIRY` and
  `DOCUMENT_RENEWAL`.
- The backend stores files but exposes document metadata only; there is no
  download endpoint in the current API.
- Production must use HTTPS.

## Project structure

```text
src/
├── api/             API client, endpoint functions, tests
├── components/      Shared shell, cards, fields, modals, feedback
├── context/         Authentication/session state
├── pages/           Auth and role-specific feature pages
├── App.jsx          Routes and authorization gates
├── constants.js     Backend enum mappings
└── styles.css       Responsive design system
docs/
├── API-INTEGRATION.md
├── ARCHITECTURE.md
└── LLM-IMPLEMENTATION-PROMPT.md
```

