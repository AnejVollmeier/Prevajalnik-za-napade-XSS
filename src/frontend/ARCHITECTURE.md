# React Frontend Architecture Guide

## 🏗️ Project Structure

### Pages (User-facing screens)
- **Login.jsx** - User login page
- **Register.jsx** - User registration page  
- **Dashboard.jsx** - Shows list of all analyses with summary
- **Analyze.jsx** - Code input form for new analysis
- **AnalysisDetail.jsx** - Detailed view of a specific analysis with findings

### Components
- **Header.jsx** - Top navigation with user info and logout

### Core Files
- **App.jsx** - Main app routing and layout
- **AuthContext.jsx** - Authentication state management
- **api.js** - Axios API client with interceptors
- **Routes.jsx** - Protected/public route wrappers
- **main.jsx** - React DOM entry point
- **index.css** - Global Tailwind styles

## 🔄 Data Flow

```
User Login/Register
    ↓
AuthContext stores JWT token in localStorage
    ↓
Dashboard (list of analyses)
    ↓
Analyze (submit new code)
    ↓
Backend processes XSS analysis
    ↓
AnalysisDetail (view findings)
```

## 🔐 Authentication Flow

1. User registers or logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. Token automatically added to all API requests via interceptor
5. On page refresh, token is retrieved and user session restored

## 🎨 UI Components

### Color Scheme
- Red (#ef4444) - Primary brand color for XSS/danger
- Gray (#111827, #6b7280) - Text and backgrounds
- Tailwind palette - For severity levels

### Severity Colors
- **High**: Red background with red text
- **Medium**: Yellow background with yellow text
- **Low**: Blue background with blue text

## 📡 API Integration

All API calls go through axios instance in `api.js`:

```javascript
// Automatic token injection
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 🚀 Key Features

### Authentication
- Email validation
- Password validation (min 8 chars)
- Persistent login (localStorage)
- Automatic re-authentication on page refresh

### Analysis
- Upload code up to 200KB
- Real-time scanning
- Multiple severity levels
- Line-by-line findings
- Code snippet display

### User Experience
- Responsive design
- Loading states
- Error handling
- Intuitive navigation
- ContextAPI for state management

## 📊 State Management

### Global State
- User authentication state
- Loading/error states
- User profile data

### Local State
- Form inputs
- Component-level loading states
- UI toggles

## 🔗 Component Communication

```
App.jsx
├── AuthProvider (wraps entire app)
│   ├── ProtectedRoute / PublicRoute
│   │   ├── Dashboard
│   │   │   └── Analysis list
│   │   ├── Analyze
│   │   │   └── Code submission form
│   │   └── AnalysisDetail
│   │       └── Findings display
│   └── Header (visible in all protected routes)
├── Login
└── Register
```

## 🎯 Feature Highlights

1. **Session Persistence**: Login persists across browser restarts
2. **Error Handling**: User-friendly error messages
3. **Loading States**: Visual feedback during API calls
4. **Responsive Design**: Works on desktop and tablet
5. **Code Highlighting**: Displays vulnerable code snippets
6. **Risk Scoring**: Visual representation of vulnerability levels

## 🛠️ Developer Tips

### Adding New Pages
1. Create file in `src/pages/`
2. Add route in `App.jsx`
3. Add route protection if needed

### Adding New Components
1. Create file in `src/components/`
2. Import and use in pages

### API Calls
1. Add method to `api.js`
2. Use in components with try/catch
3. Errors automatically included in responses

### Styling
- Use Tailwind utility classes
- Global styles in `index.css`
- Component-level CSS in style tags if needed

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Token not sending with requests | Check localStorage has 'token' key |
| CORS errors | Ensure backend CORS allows localhost:5173 |
| Page refresh loses login | Clear localStorage or check auth endpoint |
| API not responding | Verify backend is running on port 3000 |
| Tailwind styles not applied | Run `npm install` and restart dev server |

## 📦 Dependencies

- **react** - UI framework
- **react-router-dom** - Client-side routing
- **axios** - HTTP client
- **tailwindcss** - Utility-first CSS
- **vite** - Build tool

## 🚀 Build & Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
# Output in dist/ folder
# Deploy dist/ to hosting (Netlify, Vercel, etc.)
```

## 🔒 Security Considerations

1. **JWT Tokens**: Stored in localStorage (XSS vulnerable)
   - Solution: Consider using httpOnly cookies in production
2. **API Keys**: Never commit .env files
3. **CORS**: Only allow trusted origins in production
4. **CSP Headers**: Configure Content Security Policy

---

For more information, see SETUP.md for installation and configuration.

