# XSS Vulnerability Checker - Frontend

A React-based frontend for analyzing JavaScript code for XSS (Cross-Site Scripting) vulnerabilities.

## Features

- **User Authentication**: Register and login securely
- **Code Analysis**: Submit JavaScript code for XSS vulnerability analysis
- **Risk Scoring**: Get a comprehensive risk score (0-100%)
- **Detailed Findings**: View vulnerabilities by severity (High, Medium, Low)
- **Analysis History**: Access all your previous analyses
- **Recommendations**: Get actionable suggestions to fix vulnerabilities

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building

Create a production build:

```bash
npm run build
```

## Project Structure

```
src/
├── components/        # Reusable React components
├── pages/            # Page components
├── AuthContext.jsx   # Authentication context
├── api.js           # API client configuration
├── Routes.jsx       # Route protection logic
├── App.jsx          # Main app component
├── main.jsx         # React entry point
└── index.css        # Global styles
```

## API Integration

The frontend connects to the backend API at `http://localhost:3000/api`

### Authenticated Endpoints

- `GET /auth/me` - Get current user
- `POST /analyze` - Submit code for analysis
- `GET /analyses` - Get user's analysis history
- `GET /analyses/:id` - Get analysis details

## Features

### Authentication
- User registration with email validation
- Secure login with JWT tokens
- Session persistence

### Analysis
- Large code file support (up to 200KB)
- Real-time XSS vulnerability detection
- Color-coded severity levels
- Line-by-line vulnerability mapping
- Code snippet previews

### Dashboard
- View all analyses with risk scores
- Quick access to findings summary
- Click to view detailed reports

## Styling

The project uses Tailwind CSS for styling. Configuration is in `tailwind.config.js`.

## License

MIT

