# XSS Vulnerability Checker - Backend

Backend za statično analizo DOM XSS ranljivosti zgrajen na Node.js, Express in Prisma ORM.

## Nastavitev okolja

1. Namesti odvisnosti:

   ```bash
   npm install
   ```

2. Ustvari `.env` datoteko v mapi `src/backend` in nastavi spodnje spremenljivke okolja:

   ```env
   # Vrata (port), na katerih bo tekel strežnik
   PORT=3000

   # Skrivni ključ za podpisovanje JWT žetonov (uporabi varno geslo)
   JWT_SECRET=super-secret-key-for-jwt-development

   # Pot do lokalne SQLite baze
   DATABASE_URL="file:./dev.db"
   ```

3. Inicializiraj podatkovno bazo:

   ```bash
   npx prisma migrate dev --name init
   ```

4. Zaženi aplikacijo v razvojnem načinu:
   ```bash
   npm run dev
   ```

## Testiranje API s cURL

### 1. Registracija

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"password123\"}"
```

### 2. Prijava (shrani prejeti `token`)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"password123\"}"
```

### 3. GET /api/auth/me

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <TUKAJ_VNESI_TOKEN>"
```

### 4. Analiza kode

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TUKAJ_VNESI_TOKEN>" \
  -d "{\"target\":\"dom-js\",\"inputMode\":\"paste\",\"code\":\"document.body.innerHTML = location.search;\"}"
```

### 5. Seznam analiz (Zgodovina)

```bash
curl -X GET http://localhost:3000/api/analyses \
  -H "Authorization: Bearer <TUKAJ_VNESI_TOKEN>"
```

### 6. Detajl analize

```bash
curl -X GET http://localhost:3000/api/analyses/1 \
  -H "Authorization: Bearer <TUKAJ_VNESI_TOKEN>"
```
