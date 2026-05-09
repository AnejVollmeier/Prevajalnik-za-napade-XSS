# XSS Vulnerability Checker - Backend

Backend for static analysis of DOM XSS vulnerabilities built on Node.js, Express, and Prisma ORM.

## Environment Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create an `.env` file in the `src/backend` folder and set the environment variables below:

   ```env
   # Port on which the server will run
   PORT=3000

   # Secret key for signing JWT tokens (use a secure password)
   JWT_SECRET=super-secret-key-for-jwt-development

   # Path to the local SQLite database
   DATABASE_URL="file:./dev.db"
   ```

3. Initialize the database:

   ```bash
   npx prisma migrate dev --name init
   ```

4. Run the application in development mode:
   ```bash
   npm run dev
   ```

## Testing the API with cURL

### 1. Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"password123\"}"
```

### 2. Login (save the received `token`)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"password123\"}"
```

### 3. GET /api/auth/me

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <INSERT_TOKEN_HERE>"
```

### 4. Code Analysis

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <INSERT_TOKEN_HERE>" \
  -d "{\"target\":\"dom-js\",\"inputMode\":\"paste\",\"code\":\"document.body.innerHTML = location.search;\"}"
```

### 5. List of Analyses (History)

```bash
curl -X GET http://localhost:3000/api/analyses \
  -H "Authorization: Bearer <INSERT_TOKEN_HERE>"
```

### 6. Analysis Detail

```bash
curl -X GET http://localhost:3000/api/analyses/1 \
  -H "Authorization: Bearer <INSERT_TOKEN_HERE>"
```
