# GitHub Analysis Feature - Quick Start Guide

## Setup & Testing

### Prerequisites
- Node.js installed
- Running database (Prisma SQLite)
- Backend and frontend services

### Installation (Already Done)
Dependencies have been installed:
```bash
cd src/backend
npm install simple-git axios  # Already installed
```

### Running the Application

#### 1. Start the Backend
```bash
cd src/backend
npm start
# Server runs on http://localhost:3000
```

#### 2. Start the Frontend (in a new terminal)
```bash
cd src/frontend
npm run dev
# Frontend runs on http://localhost:5173
```

### Testing the GitHub Analysis Feature

#### Step 1: Log in or Register
Navigate to `http://localhost:5173` and create an account or log in

#### Step 2: Go to Analyze Page
Click on "Analyze" in the navigation menu

#### Step 3: Switch to GitHub Tab
Click on the "GitHub Repository" tab

#### Step 4: Test with a Sample Repository
Paste a public GitHub URL, for example:
- `https://github.com/facebook/react`
- `https://github.com/lodash/lodash`
- `https://github.com/vuejs/vue`
- `https://github.com/microsoft/TypeScript`

#### Step 5: Analyze
Click "Analyze Repository" and wait for the results

The system will:
1. Clone the repository (shallow clone, faster)
2. Extract JavaScript files (excluding node_modules, dist, etc.)
3. Scan for XSS vulnerabilities
4. Display results with severity levels

### Expected Behavior

#### Success Response
```json
{
  "analysisId": "abc123",
  "target": "dom-js",
  "inputMode": "github",
  "projectName": "react",
  "repoUrl": "https://github.com/facebook/react",
  "fileCount": 125,
  "scoreOverall": 42,
  "summary": {
    "high": 8,
    "medium": 15,
    "low": 32
  },
  "findings": [
    {
      "ruleId": "DOM-001",
      "severity": "High",
      "message": "Unsafe DOM manipulation detected",
      "file": "src/components/Component.js",
      "line": 42,
      "snippet": "element.innerHTML = userInput;"
    }
    // ... more findings
  ]
}
```

#### Error Cases

**Invalid URL Format:**
```
"Invalid GitHub repository URL"
```

**No JavaScript Files Found:**
```
"No JavaScript files found in the repository (excluding node_modules, dist, etc.)"
```

**Network/Cloning Error:**
```
"Internal Server Error" (500)
```

### Troubleshooting

#### Issue: "EADDRINUSE" Error
**Problem:** Port 3000 is already in use
**Solution:**
```bash
# Kill the process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### Issue: Git Not Found
**Problem:** The system can't find `git` command
**Solution:**
- Install Git from https://git-scm.com/
- Ensure git is in your PATH
- Restart terminal/IDE after installation

#### Issue: Timeout While Cloning
**Problem:** Large repositories take too long
**Solution:**
- The feature uses shallow cloning (only latest commit)
- Try smaller repositories first
- Check network connection

#### Issue: 2MB Size Limit Exceeded
**Problem:** Repository has too much JavaScript code
**Solution:**
- This is by design to prevent memory issues
- Try analyzing a different repository
- Or analyze individual files/smaller projects

### Database Storage

Analyses are stored in the database with:
- Table: `Analysis`
- `inputMode`: "github" (distinguishes from "paste" and "project")
- `reportJson` contains the full analysis data including original URL

To view stored analyses:
```bash
# Using Prisma Studio
cd src/backend
npx prisma studio
```

Navigate to the Analysis table to see all analyses by input mode

### Next Steps / Future Features

To enhance the GitHub analysis feature:

1. **GitHub Authentication:**
   - Add support for private repositories using GitHub tokens
   - Allow users to paste GitHub token in settings
   - Increase API rate limits

2. **Progress Tracking:**
   - Show progress bar while cloning/analyzing
   - WebSocket updates for real-time progress
   - Estimated time remaining

3. **Advanced Filtering:**
   - Allow users to select specific branches or tags
   - Filter which files to analyze
   - Exclude additional patterns

4. **Scheduled Analysis:**
   - Schedule periodic analysis of repositories
   - Track vulnerability trends over time
   - Email reports

5. **Performance Optimization:**
   - Cache analyzed repositories
   - Parallel file scanning
   - Compress stored code

## Files Modified/Created

### New Files
- `src/backend/src/analyzer/githubAnalyzer.js` - GitHub cloning and analysis logic

### Modified Files
- `src/backend/src/routes/analyze.js` - Added `/github` endpoint
- `src/frontend/src/pages/Analyze.jsx` - Added GitHub UI and mode tabs
- `src/frontend/src/api.js` - Added `submitGithub()` API method
- `src/backend/package.json` - Added `simple-git` and `axios` dependencies

## API Endpoint Reference

### Analyze GitHub Repository

**Endpoint:** `POST /api/analyze/github`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "target": "dom-js",
  "repoUrl": "https://github.com/username/repository"
}
```

**Response (200 OK):**
```json
{
  "analysisId": "string",
  "target": "dom-js",
  "inputMode": "github",
  "projectName": "string",
  "repoUrl": "string",
  "fileCount": number,
  "scoreOverall": number,
  "summary": {
    "high": number,
    "medium": number,
    "low": number
  },
  "findings": [
    {
      "ruleId": "string",
      "severity": "High|Medium|Low",
      "message": "string",
      "recommendation": "string",
      "file": "string",
      "line": number,
      "snippet": "string"
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Invalid URL or no JavaScript files found
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Server error during cloning or analysis

