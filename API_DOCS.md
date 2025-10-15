## GamePlan API Documentation (Somali)

### Table of Contents
- [Guudmar](#guudmar)
- [Tokens](#tokens)
- [Endpoints Index](#endpoints-index)
- [Auth](#auth)
- [Users](#users)
- [Leagues](#leagues)
- [Teams](#teams)
- [Players](#players)
- [Fixtures](#fixtures)
- [Results](#results)
- [Referees](#referees)
- [Venues](#venues)
- [Headers](#headers)
- [Postman Notes](#postman-notes)
- [Error Model & Common Responses](#error-model--common-responses)
- [Qodobo Muhiim ah](#qodobo-muhiim-ah)

**Base URL**: `GamePlan`

### Guudmar
- **Authentication**: JWT token ayaa looga baahan yahay dhammaan endpoints-ka marka laga reebo `Auth`. U isticmaal header: `Authorization: Bearer <JWT_TOKEN>`.
- **Roles**: `ADMIN` iyo `COACH`. Howlo qiyaas ah (abuurid/cusboonaynid/tirtirid) waxay u baahan yihiin `ADMIN`.
- **Content-Type**: `application/json`
- **CORS**: Waa la taageeraa (CORS enabled).

### Tokens
- Waxaa la soo saaraa `JWT` oo leh sirta `process.env.JWT_SECRET` ama default `"mysecret"`.
- Nolosha token-ka: `login` → 24 saac; `register` → 48 saac.
- Ku gudbi token-ka sida: `Authorization: Bearer <token>`.

---

### Endpoints Index
- Auth: `GamePlan/auth/register`, `GamePlan/auth/login`
- Users: `GamePlan/users`, `GamePlan/users/:id`
- Leagues: `GamePlan/leagues`, `GamePlan/leagues/:id`
- Teams: `GamePlan/teams`, `GamePlan/leagues/:leagueId/teams`, `GamePlan/teams/:id`
- Players: `GamePlan/players`, `GamePlan/teams/:teamId/players`, `GamePlan/players/:id`
- Fixtures: `GamePlan/fixtures`, `GamePlan/fixtures/:id`, `GamePlan/leagues/:leagueId/fixtures`, `GamePlan/teams/:teamId/fixtures`, `GamePlan/fixtures/date-range`, `GamePlan/fixtures/:id/status`
- Results: `GamePlan/results`, `GamePlan/results/:id`, `GamePlan/fixtures/:fixtureId/result`, `GamePlan/leagues/:leagueId/results`, `GamePlan/teams/:teamId/results`
- Referees: `GamePlan/referees`, `GamePlan/referees/:id`
- Venues: `GamePlan/venues`, `GamePlan/venues/:id`

Fiiro: `server.js` waxa uu mount-gareeyaa routes sidan: users/teams/players/fixtures/results/referees/venues → `"/api"`, iyo auth → `"/api/auth"`. Maadaama aad codsatay Base URL `GamePlan`, halkan waxaan u muujinaynaa path-yada sida `GamePlan/...`. Haddii aad isticmaaleysid server-ka hadda jira, u dhigmaan waxay noqonayaan `/api/...` iyo `/api/auth/...`.

---

### Auth

- POST `GamePlan/auth/register`
  - Sharaxaad: Diiwaangelinta user cusub.
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

- POST `GamePlan/auth/login`
  - Sharaxaad: Gelitaanka user jira.
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

---

### Users
Requires: `Authorization: Bearer <JWT>`

- GET `GamePlan/users` (ADMIN kaliya)
  - Response 200:
    ```json
    { "success": true, "count": 2, "data": [ { "id": "...", "email": "..." } ] }
    ```

- GET `GamePlan/users/:id` (ADMIN ama isla user-kaas)
  - Response 200:
    ```json
    { "success": true, "data": { "id": "...", "email": "..." } }
    ```

- POST `GamePlan/users` (ADMIN kaliya)
  - Body (tusaale):
    ```json
    { "firstName": "Layla", "lastName": "Ali", "email": "layla@example.com", "password": "Secret123!", "role": "COACH" }
    ```
  - Response 201: `{ "success": true, "data": { ... } }`

- PUT `GamePlan/users/:id` (ADMIN ama isla user-kaas)
  - Body: json fields la cusboonaysiinayo
  - Response 200: `{ "success": true, "data": { ... } }`

- DELETE `GamePlan/users/:id` (ADMIN ama isla user-kaas)
  - Response 200: `{ "success": true, "data": { ... } }`

---

### Leagues
Requires: `Authorization: Bearer <JWT>`

- GET `GamePlan/leagues`
- GET `GamePlan/leagues/:id`
- POST `GamePlan/leagues` (ADMIN)
- PUT `GamePlan/leagues/:id` (ADMIN)
- DELETE `GamePlan/leagues/:id` (ADMIN)

Tusaale Response (GET all):
```json
{ "success": true, "count": 1, "data": [ { "id": "...", "name": "Premier League" } ] }
```

---

### Teams
Requires: `Authorization: Bearer <JWT>`

- GET `GamePlan/teams`
- GET `GamePlan/leagues/:leagueId/teams`
- GET `GamePlan/teams/:id`
- POST `GamePlan/teams` (ADMIN)
- PUT `GamePlan/teams/:id` (ADMIN)
- DELETE `GamePlan/teams/:id` (ADMIN)

Tusaale Request (POST):
```json
{ "name": "Team A", "leagueId": "clx..." }
```

---

### Players
Requires: `Authorization: Bearer <JWT>`

- GET `GamePlan/players`
- GET `GamePlan/teams/:teamId/players`
- GET `GamePlan/players/:id`
- POST `GamePlan/players` (ADMIN)
- PUT `GamePlan/players/:id` (ADMIN)
- DELETE `GamePlan/players/:id` (ADMIN)

Tusaale Request (POST):
```json
{ "firstName": "Mo", "lastName": "Salah", "teamId": "clx123...", "position": "FW", "number": 11 }
```

---

### Fixtures
Requires: `Authorization: Bearer <JWT>`

- GET `GamePlan/fixtures`
- GET `GamePlan/fixtures/:id`
- GET `GamePlan/leagues/:leagueId/fixtures`
- GET `GamePlan/teams/:teamId/fixtures`
- GET `GamePlan/fixtures/date-range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- POST `GamePlan/fixtures` (ADMIN)
- PUT `GamePlan/fixtures/:id` (ADMIN)
- PATCH `GamePlan/fixtures/:id/status` (ADMIN; status ∈ ["Scheduled","Completed","Postponed"]) 
- DELETE `GamePlan/fixtures/:id` (ADMIN)

Tusaale (PATCH status):
```json
{ "status": "Completed" }
```

---

### Results
Requires: `Authorization: Bearer <JWT>`

- GET `GamePlan/results`
- GET `GamePlan/results/:id`
- GET `GamePlan/fixtures/:fixtureId/result`
- GET `GamePlan/leagues/:leagueId/results`
- GET `GamePlan/teams/:teamId/results`
- POST `GamePlan/results` (ADMIN)
- POST `GamePlan/fixtures/:fixtureId/result` (ADMIN; isla transaction-ka waxa uu cusboonaysiiyaa fixture) 
- PUT `GamePlan/results/:id` (ADMIN)
- PUT `GamePlan/fixtures/:fixtureId/result` (ADMIN)
- DELETE `GamePlan/results/:id` (ADMIN)
- DELETE `GamePlan/fixtures/:fixtureId/result` (ADMIN)

Tusaale Request (POST /fixtures/:fixtureId/result):
```json
{ "homeScore": 2, "awayScore": 1 }
```

---

### Referees
Requires: `Authorization: Bearer <JWT>`

- GET `GamePlan/referees`
- GET `GamePlan/referees/:id`
- POST `GamePlan/referees` (ADMIN)
- PUT `GamePlan/referees/:id` (ADMIN)
- DELETE `GamePlan/referees/:id` (ADMIN)

---

### Venues
Requires: `Authorization: Bearer <JWT>`

- GET `GamePlan/venues`
- GET `GamePlan/venues/:id`
- POST `GamePlan/venues` (ADMIN)
- PUT `GamePlan/venues/:id` (ADMIN)
- DELETE `GamePlan/venues/:id` (ADMIN)

---

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Postman Notes
- Ku dar header `Authorization: Bearer <JWT_TOKEN>` marka aad tijaabinayso endpoints (marka laga reebo `auth/register` iyo `auth/login`).
- Dooro `Body` → `raw` → `JSON` marka aad diro JSON requests.
- Ku dar query params sida `fixtures/date-range` adigoo isticmaalaya tab-ka `Params`.

---

### Error Model & Common Responses
- 200 OK: Request guulaysatay.
- 201 Created: Kayd cusub ayaa la abuuray.
- 400 Bad Request: Xog khaldan/maqan (tusaale ahaan fixtures/date-range startDate ama endDate maqan).
- 401 Unauthorized: Token maqan ama khaldan.
- 403 Forbidden: Doorasho aan lahayn rukhsad (ADMIN kaliya).
- 404 Not Found: Kayd aan la helin.
- 500 Internal Server Error: Khalad lama filaan ah.

Tusaale Error 400:
```json
{ "success": false, "error": "Valid status is required (Scheduled, Completed, Postponed)" }
```

---

### Qodobo Muhiim ah
- Waxaa lagu talinayaa in aad mar walba dirto `Authorization: Bearer <token>` marka laga reebo `auth/register` iyo `auth/login`.
- `status` ee fixtures waa mid ka mid ah: `Scheduled`, `Completed`, `Postponed`.
- `fixtures/date-range` waxay u baahan tahay `startDate` iyo `endDate` query params.
- Hadda ma jiraan pagination iyo rate limits oo lagu qeexay code-ka; haddii loo baahdo, waa la dari karaa mustaqbalka.


