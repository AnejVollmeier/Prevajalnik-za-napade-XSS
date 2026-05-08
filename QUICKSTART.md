ne vem keri je # 🚀 Quick Start Guide

## Running the Full Application

### Terminal 1: Backend Server

```bash
cd src/backend

# First time only
npm install
npm run prisma:migrate
npm run prisma:generate

# Set up .env file
# Create file: src/backend/.env
# DATABASE_URL="file:./dev.db"
# JWT_SECRET="your-secret-key"
# PORT=3000

# Start backend (watch mode)
npm run dev
```

✅ Backend runs at: `http://localhost:3000`

### Terminal 2: Frontend Server

```bash
cd src/frontend

# First time only
npm install

# Start frontend (watch mode)
npm run dev
```

✅ Frontend runs at: `http://localhost:5173`

## 🧪 Testing the App

### 1. Register Account
- Go to `http://localhost:5173/register`
- Enter email: `test@example.com`
- Enter password: `password123`
- Click Register

### 2. Login
- Go to `http://localhost:5173/login`
- Use credentials from registration
- Click Login

### 3. Analyze Code
- Click "New Analysis" button
- Paste sample vulnerable code:
  ```javascript
  const userInput = getUserInput();
  document.getElementById('content').innerHTML = userInput;
  eval(userInput);
  document.write(userInput);
  ```
- Click "Analyze Code"

### 4. View Results
- See risk score and findings
- View severity breakdown
- Read recommendations

### 5. View History
- Click "Dashboard"
- See all your analyses
- Click any analysis to view details

## 📚 Sample Vulnerable Code Snippets

### High Severity
```javascript
// Dangerous DOM manipulation
const data = obtainUserInput();
document.body.innerHTML += data;

// eval usage
eval(userSuppliedCode);

// document.write
document.write(userInput);
```

### Medium Severity
```javascript
// Unsafe innerHTML assignment
element.innerHTML = userValue;

// insertAdjacentHTML without sanitization
document.getElementById('container').insertAdjacentHTML('beforeend', htmlString);
```

### Low Severity
```javascript
// textContent is safer but still risky with certain inputs
element.textContent = userInput;
```

## 🛑 Stopping the Servers

- **Backend**: Press `Ctrl+C` in terminal 1
- **Frontend**: Press `Ctrl+C` in terminal 2

## 📦 Building for Production

### Backend
```bash
cd src/backend
npm run prisma:generate
npm start
```

### Frontend
```bash
cd src/frontend
npm run build
# Upload dist/ folder to hosting
```

## 🐛 Troubleshooting

### Backend won't start
1. Delete `dev.db` file
2. Run `npm run prisma:migrate`
3. Ensure port 3000 is free

### Frontend won't start
1. Delete `node_modules` folder
2. Run `npm install` again
3. Ensure port 5173 is free

### Can't connect to backend
1. Verify backend is running on port 3000
2. Check `.env` file exists in backend directory
3. Check CORS origin in `backend/src/app.js`

### Login not working
1. Check `.env` has valid JWT_SECRET
2. Verify database migration ran successfully
3. Look for errors in backend console

### Code not analyzing
1. Ensure code is not empty
2. Check backend console for errors
3. Verify authentication token exists

## 📝 Next Steps

- Read `SETUP.md` for detailed configuration
- Check `ARCHITECTURE.md` for code structure
- Review backend `README.md` for API docs
- Explore code analyzer rules in `backend/src/analyzer/rules/`

## 💡 Tips

- Keep both terminals visible for debugging
- Check browser console for frontend errors
- Check terminal 1 for backend API errors
- Use browser DevTools (F12) to inspect network requests
- Clear localStorage if stuck in login loop: `localStorage.clear()`

---

Enjoy analyzing! 🔍

