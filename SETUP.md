# XSS Vulnerability Checker

A full-stack application for detecting XSS (Cross-Site Scripting) vulnerabilities in JavaScript code.

## 📋 Project Structure

```
Prevajalnik-za-napade-XSS/
├── src/
│   ├── backend/          # Node.js/Express backend with Prisma
│   │   ├── package.json
│   │   ├── prisma/       # Database schema and migrations
│   │   └── src/
│   │       ├── app.js
│   │       ├── server.js
│   │       ├── routes/       # API endpoints
│   │       ├── analyzer/     # XSS scanning logic
│   │       ├── db/           # Database client
│   │       └── middleware/   # Authentication
│   └── frontend/         # React frontend with Vite
│       ├── package.json
│       ├── src/
│       │   ├── pages/        # Page components
│       │   ├── components/   # Reusable components
│       │   └── App.jsx
│       └── vite.config.js
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd src/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   # .env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   PORT=3000
   ```

4. Set up database:
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

5. Start the backend:
   ```bash
   npm run dev
   ```

   Backend will run at `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd src/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   Frontend will run at `http://localhost:5173`

## 🔧 Features

### Authentication
- User registration with email validation
- Password hashing with bcryptjs
- JWT-based authentication
- Secure session management

### Code Analysis
- DOM-based XSS detection
- Pattern matching for vulnerable sinks and sources
- Severity classification (High, Medium, Low)
- Line-by-line vulnerability mapping
- Risk scoring (0-100%)

### User Interface
- Clean, modern dashboard
- Real-time code analysis
- Analysis history tracking
- Detailed vulnerability reports
- Code snippet highlighting

## 📝 Available Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Analysis
- `POST /api/analyze` - Submit code for analysis
- `GET /api/analyses` - Get user's analyses (requires auth)
- `GET /api/analyses/:id` - Get analysis details (requires auth)

## 🗄️ Database

The application uses **SQLite** with Prisma ORM.

### Schema
- **Users**: Store user accounts with email and password hash
- **Analyses**: Store scan results with findings and scores

Run migrations:
```bash
npm run prisma:migrate
```

## 🔐 Security

- Passwords are hashed using bcryptjs
- JWT tokens expire after 1 day
- CORS enabled for localhost:5173
- Request payload limited to 250KB
- Input validation with Zod

## 🛠️ Development

### Backend
- Framework: Express.js
- Database: SQLite with Prisma
- Validation: Zod
- Authentication: JWT
- Password hashing: bcryptjs

### Frontend
- Framework: React 18
- Build tool: Vite
- Routing: React Router
- Styling: Tailwind CSS
- HTTP: Axios

## 📦 Building for Production

### Backend
```bash
cd src/backend
npm run prisma:migrate
npm start
```

### Frontend
```bash
cd src/frontend
npm run build
# Deploy the dist/ directory to your hosting
```

## 🐛 Troubleshooting

### Port conflicts
- Backend: Change `PORT` in `.env`
- Frontend: Add `--port XXXX` to `npm run dev`

### Database issues
- Delete `dev.db` and run migrations again
- Check `.env` DATABASE_URL is correct

### CORS errors
- Verify frontend runs on `http://localhost:5173`
- Check backend CORS configuration in `src/backend/src/app.js`

## 📄 License

MIT

