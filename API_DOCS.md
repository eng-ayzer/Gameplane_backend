## GamePlan API Documentation

### Table of Contents
- [Overview](#overview)
- [Tokens](#tokens)
- [Endpoints Index](#endpoints-index)
- [Auth](#auth)
- [Users](#users)
- [Leagues](#leagues)
- [Teams](#teams)
- [Players](#players)
- [Coaches](#coaches)
- [Fixtures](#fixtures)
- [Results](#results)
- [Referees](#referees)
- [Venues](#venues)
- [Headers](#headers)
- [Postman Notes](#postman-notes)
- [Error Model & Common Responses](#error-model--common-responses)
- [Important Notes](#important-notes)

**Base URL**: `http://localhost:3000/api`

### Overview
- **Authentication**: JWT token is required for all endpoints except `Auth`. Use header: `Authorization: Bearer <JWT_TOKEN>`.
- **Roles**: `ADMIN` and `COACH`. Write operations (create/update/delete) require `ADMIN` role.
- **Content-Type**: `application/json`
- **CORS**: Supported (CORS enabled).

### Tokens
- JWT tokens are generated with secret `process.env.JWT_SECRET` or default `"mysecret"`.
- Token lifetime: `login` → 24 hours; `register` → 48 hours.
- Send token as: `Authorization: Bearer <token>`.

---

### Endpoints Index
- Auth: `/api/auth/register`, `/api/auth/login`
- Users: `/api/users`, `/api/users/:id`
- Leagues: `/api/leagues`, `/api/leagues/:id`
- Teams: `/api/teams`, `/api/leagues/:leagueId/teams`, `/api/teams/:id`
- Players: `/api/players`, `/api/teams/:teamId/players`, `/api/players/:id`
- Coaches: `/api/coaches`, `/api/coaches/me`, `/api/teams/:teamId/coaches`, `/api/coaches/:id`
- Fixtures: `/api/fixtures`, `/api/fixtures/:id`, `/api/leagues/:leagueId/fixtures`, `/api/teams/:teamId/fixtures`, `/api/fixtures/date-range`, `/api/fixtures/:id/status`
- Results: `/api/results`, `/api/results/:id`, `/api/fixtures/:fixtureId/result`, `/api/leagues/:leagueId/results`, `/api/teams/:teamId/results`
- Referees: `/api/referees`, `/api/referees/:id`
- Venues: `/api/venues`, `/api/venues/:id`

Note: `server.js` mounts routes as follows: users/teams/players/fixtures/results/referees/venues → `"/api"`, and auth → `"/api/auth"`. The actual endpoints use `/api/...` and `/api/auth/...` prefixes.

---

### Auth

- POST `/api/auth/register`
  - Description: Register a new user.
  - Body:
    ```json
    {
      "firstName": "Ali",
      "lastName": "Ahmed",
      "email": "ali@example.com",
      "password": "Secret123!",
      "role": "ADMIN" | "COACH"
    }
    ```
  - Response 201:
    ```json
    {
      "success": true,
      "message": "User registered successfully",
      "data": { "user": { "id": "...", "firstName": "Ali", "lastName": "Ahmed", "email": "ali@example.com", "role": "COACH" }, "token": "<JWT>" }
    }
    ```
  - Notes: Token expiry 48h.

- POST `/api/auth/login`
  - Description: Login existing user.
  - Body:
    ```json
    { "email": "ali@example.com", "password": "Secret123!", "role": "ADMIN" }
    ```
  - Response 200:
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": { "user": { "id": "...", "email": "ali@example.com", "role": "ADMIN" }, "token": "<JWT>" }
    }
    ```
  - Notes: Token expiry 24h.

  - Middleware behavior:
    - `authenticateToken` verifies the JWT and attaches `req.user` (id, firstName, lastName, email, phone, role, createdAt). If the authenticated user is a COACH, the middleware also attaches `req.coach` (full coach profile including `team_id`). Missing token returns **401** (`Access token required`). Invalid/expired token returns **403** (`Invalid or expired token`). If a COACH account exists but no coach profile is found, the middleware returns **403** (`Coach profile not found`).
    - `authorizeRole(...roles)` restricts access by role and returns **403** on insufficient permissions.

---

### Users
Requires: `Authorization: Bearer <JWT>`

- GET `/api/users` (ADMIN only)
  - Response 200:
    ```json
    { "success": true, "count": 2, "data": [ { "id": "...", "email": "..." } ] }
    ```

- GET `/api/users/:id` (ADMIN or same user)
  - Response 200:
    ```json
    { "success": true, "data": { "id": "...", "email": "..." } }
    ```

- POST `/api/users` (ADMIN only)
  - Body (example):
    ```json
    { "firstName": "Layla", "lastName": "Ali", "email": "layla@example.com", "password": "Secret123!", "role": "COACH" }
    ```
  - Response 201: `{ "success": true, "data": { ... } }`

- PUT `/api/users/:id` (ADMIN or same user)
  - Body: JSON fields to update
  - Response 200: `{ "success": true, "data": { ... } }`

- DELETE `/api/users/:id` (ADMIN or same user)
  - Response 200: `{ "success": true, "data": { ... } }`

---

### Leagues
Requires: `Authorization: Bearer <JWT>`

- GET `/api/leagues`
- GET `/api/leagues/:id`
- POST `/api/leagues` (ADMIN)
- PUT `/api/leagues/:id` (ADMIN)
- DELETE `/api/leagues/:id` (ADMIN)

Example Response (GET all):
```json
{ "success": true, "count": 1, "data": [ { "id": "...", "name": "Premier League" } ] }
```

---

### Teams
Requires: `Authorization: Bearer <JWT>`

Notes: Role-specific behavior — **ADMIN** has full access; **COACH** can only view and update their assigned team (`req.coach.team_id`).

- GET `/api/teams`
  - ADMIN: returns all teams.
  - COACH: returns only the coach's assigned team (if any).
- GET `/api/leagues/:leagueId/teams`
  - ADMIN & COACH: returns teams for the league (COACH may only see their team in effect).
- GET `/api/teams/:id`
  - ADMIN: allowed.
  - COACH: allowed only if `id` equals `req.coach.team_id` (403 otherwise).
- POST `/api/teams`
  - ADMIN only.
- PUT `/api/teams/:id`
  - ADMIN: allowed.
  - COACH: allowed only for their own team (`req.coach.team_id`), otherwise 403.
- DELETE `/api/teams/:id`
  - ADMIN only.

Example Request (POST):
```json
{ "name": "Team A", "leagueId": "clx..." }
```

---

### Players
Requires: `Authorization: Bearer <JWT>`

Notes: Role-specific behavior — **ADMIN** has full access; **COACH** is limited to their own team (middleware sets `req.coach.team_id`).

- GET `/api/players`
  - ADMIN: returns all players.
  - COACH: returns only players in their `req.coach.team_id`.
- GET `/api/teams/:teamId/players`
  - ADMIN: can fetch any team's players.
  - COACH: can fetch only their own team (403 if `teamId` !== `req.coach.team_id`).
- GET `/api/players/:id`
  - ADMIN: allowed.
  - COACH: allowed only if the player's `team_id` matches `req.coach.team_id` (403 otherwise).
- POST `/api/players`
  - ADMIN: can create player for any team.
  - COACH: can create player only for their own team — `req.body.team_id` must equal `req.coach.team_id` (403 otherwise).
- PUT `/api/players/:id`
  - ADMIN: allowed.
  - COACH: allowed only for players in their team; coach cannot change `team_id` to move a player to another team (403 if attempted).
- DELETE `/api/players/:id`
  - ADMIN: allowed.
  - COACH: allowed only for players in their team.

Example Request (POST):
```json
{ "firstName": "Mo", "lastName": "Salah", "teamId": "clx123...", "position": "FW", "number": 11 }
```

---

### Coaches
Requires: `Authorization: Bearer <JWT>`

- GET `/api/coaches`
- GET `/api/coaches/me` (COACH only) — Returns logged-in coach's profile, team, and players in one response (dashboard)
- GET `/api/teams/:teamId/coaches`
- GET `/api/coaches/:id`
- POST `/api/coaches` (ADMIN)
- PUT `/api/coaches/:id` (ADMIN)
- DELETE `/api/coaches/:id` (ADMIN)

Example Request (POST) — `email` and `password` are required so the coach can login:
```json
{
  "first_name": "Pep",
  "last_name": "Guardiola",
  "team_id": "clx123...",
  "email": "pep@example.com",
  "password": "Secret123!",
  "phone": "+1234567890",
  "license_level": "UEFA Pro",
  "experience_years": 15,
  "nationality": "Spanish",
  "date_of_birth": "1971-01-18"
}
```

Example Response (GET /coaches/me — COACH dashboard):
```json
{
  "success": true,
  "data": {
    "coach_id": "clx...",
    "first_name": "Pep",
    "last_name": "Guardiola",
    "email": "pep@example.com",
    "team": {
      "team_id": "clx123...",
      "name": "Manchester City",
      "league": { "league_id": "...", "name": "Premier League" },
      "players": [
        { "player_id": "...", "first_name": "Mo", "last_name": "Salah", "position": "FW", "jersey_number": 11 }
      ]
    }
  }
}
```

Example Response (GET all):
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "coach_id": "clx...",
      "first_name": "Pep",
      "last_name": "Guardiola",
      "email": "pep@example.com",
      "phone": "+1234567890",
      "license_level": "UEFA Pro",
      "experience_years": 15,
      "nationality": "Spanish",
      "date_of_birth": "1971-01-18T00:00:00.000Z",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "team": {
        "team_id": "clx123...",
        "name": "Manchester City",
        "league": {
          "league_id": "clx456...",
          "name": "Premier League"
        }
      }
    }
  ]
}
```

---

### Fixtures
- **Public (no auth):** GET `/api/fixtures`, GET `/api/fixtures/:id`, GET `/api/leagues/:leagueId/fixtures`, GET `/api/teams/:teamId/fixtures`, GET `/api/fixtures/date-range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- **Protected:** POST `/api/fixtures` (ADMIN), PUT, PATCH, DELETE (ADMIN) — require `Authorization: Bearer <JWT>`
- PUT `/api/fixtures/:id` (ADMIN)
- PATCH `/api/fixtures/:id/status` (ADMIN; status ∈ ["Scheduled","Completed","Postponed"]) 
- DELETE `/api/fixtures/:id` (ADMIN)

Example (PATCH status):
```json
{ "status": "Completed" }
```

---

### Results
- **Public (no auth):** GET `/api/results`, GET `/api/results/:id`, GET `/api/fixtures/:fixtureId/result`, GET `/api/leagues/:leagueId/results`, GET `/api/teams/:teamId/results`
- **Protected:** POST, PUT, DELETE (ADMIN) — require `Authorization: Bearer <JWT>`
- POST `/api/fixtures/:fixtureId/result` (ADMIN; in same transaction updates fixture) 
- PUT `/api/results/:id` (ADMIN)
- PUT `/api/fixtures/:fixtureId/result` (ADMIN)
- DELETE `/api/results/:id` (ADMIN)
- DELETE `/api/fixtures/:fixtureId/result` (ADMIN)

Example Request (POST /fixtures/:fixtureId/result):
```json
{ "homeScore": 2, "awayScore": 1 }
```

---

### Referees
Requires: `Authorization: Bearer <JWT>`

- GET `/api/referees`
- GET `/api/referees/:id`
- POST `/api/referees` (ADMIN)
- PUT `/api/referees/:id` (ADMIN)
- DELETE `/api/referees/:id` (ADMIN)

---

### Venues
Requires: `Authorization: Bearer <JWT>`

- GET `/api/venues`
- GET `/api/venues/:id`
- POST `/api/venues` (ADMIN)
- PUT `/api/venues/:id` (ADMIN)
- DELETE `/api/venues/:id` (ADMIN)

---

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Postman Notes
- Add header `Authorization: Bearer <JWT_TOKEN>` when testing protected endpoints. GET fixtures and GET results work without a token.
- Select `Body` → `raw` → `JSON` when sending JSON requests.
- Add query params like `fixtures/date-range` using the `Params` tab.

---

### Error Model & Common Responses
- 200 OK: Request successful.
- 201 Created: New record created.
- 400 Bad Request: Invalid/missing data (e.g., fixtures/date-range missing startDate or endDate).
- 401 Unauthorized: Missing or invalid token.
- 403 Forbidden: Insufficient permissions (ADMIN only).
- 404 Not Found: Record not found.
- 500 Internal Server Error: Unexpected error.

Example Error 400:
```json
{ "success": false, "error": "Valid status is required (Scheduled, Completed, Postponed)" }
```

---

### Important Notes
- Send `Authorization: Bearer <token>` for protected endpoints. Public: GET fixtures and GET results need no token; auth/register and auth/login need no token.
- Fixture `status` must be one of: `Scheduled`, `Completed`, `Postponed`.
- `fixtures/date-range` requires `startDate` and `endDate` query params.
- Currently there are no pagination and rate limits defined in the code; if needed, they can be added in the future.


