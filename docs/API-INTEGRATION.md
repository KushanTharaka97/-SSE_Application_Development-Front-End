# API integration matrix

All success responses are unwrapped from `{ timestamp, status, message, data }`.
Errors are normalized from the backend error envelope.

| Area | Endpoint | Role | UI |
|---|---|---|---|
| Auth | `POST /api/auth/login` | Public | Sign-in form |
| Auth | `POST /api/auth/register` | Public | Citizen registration |
| Auth | `POST /api/auth/admin/register` | Admin | Admin tools |
| Auth | `GET /api/auth/me` | Authenticated | Session restoration |
| Citizens | `POST /api/citizens` | Admin | Create citizen |
| Citizens | `GET /api/citizens/{id}` | Admin/Agent | Agent request detail |
| Citizens | `GET /api/citizens` | Admin | Searchable directory |
| Citizens | `PUT /api/citizens/{id}` | Admin | Edit citizen |
| Citizens | `DELETE /api/citizens/{id}` | Admin | Deactivate citizen |
| Requests | `POST /api/service-requests` | Citizen/Admin | New request |
| Requests | `GET /api/service-requests/my` | Citizen | My requests |
| Requests | `GET /api/service-requests/{id}` | All roles | Request detail |
| Requests | `GET /api/service-requests` | Agent/Admin | Filtered queue |
| Requests | `PUT /api/service-requests/{id}` | Agent/Admin | Request detail editor |
| Requests | `PATCH /api/service-requests/{id}/status` | Agent/Admin | Processing control |
| Requests | `DELETE /api/service-requests/{id}` | Admin | Cancel action |
| Requests | `GET /api/service-requests/{id}/documents` | Agent | Document list |
| Requests | `GET /api/service-requests/{id}/history` | Agent | Status timeline |
| Documents | `POST /api/documents` | Citizen | Multipart upload |
| Documents | `GET /api/documents/{id}` | Agent | Document editor |
| Documents | `PUT /api/documents/{id}` | Agent | Document editor |
| Documents | `PATCH /api/documents/{id}` | Agent | Verification control |
| Documents | `DELETE /api/documents/{id}` | Admin | Admin tools |
| Notifications | `GET /api/notifications/my` | Citizen | Notification list |
| Notifications | `PATCH /api/notifications/{id}/read` | Citizen | Mark read |
| Operations | `GET /actuator/health` | Public | API client/operations |

Endpoints are presented through role-specific workflows rather than a generic
API console. Authorization remains enforced by Spring Security.
