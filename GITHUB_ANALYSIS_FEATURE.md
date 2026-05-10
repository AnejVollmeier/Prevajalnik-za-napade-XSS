# GitHub Repository Analysis Feature

## Overview
The application now supports analyzing GitHub repositories for XSS vulnerabilities. Users can paste a GitHub repository URL and the system will clone it, extract all JavaScript files, and scan them for DOM-based XSS vulnerabilities.

## Implementation Details

### Backend Changes

#### New File: `src/backend/src/analyzer/githubAnalyzer.js`
- **`analyzeGitHubRepo(repoUrl)`**: Main function that clones a GitHub repo and analyzes it
- **`isValidGithubUrl(url)`**: Validates GitHub URL format
- **`extractRepoInfo(url)`**: Extracts owner and repo name from URL
- **`extractJsFiles(dirPath)`**: Recursively extracts JavaScript files from the cloned repo

Features:
- Shallow clones repos (only latest commit) for faster performance
- Excludes common directories: `node_modules`, `dist`, `build`, `.git`, etc.
- Supports up to 50KB per file and 2MB total size
- Cleans up temporary files after analysis
- Returns structured analysis results with findings aggregated across all files

#### Updated: `src/backend/src/routes/analyze.js`
- Added import for `analyzeGitHubRepo`
- Added `githubAnalyzeSchema` validation using Zod
- Added new endpoint: `POST /api/analyze/github`
  - Accepts: `{ target: "dom-js", repoUrl: "https://github.com/..." }`
  - Returns: Analysis results with file count, vulnerability scores, and findings
  - Stores results in database with `inputMode: "github"`

#### Dependencies Added
- `simple-git`: For cloning and interacting with Git repositories
- `axios`: For HTTP requests (already had it)

### Frontend Changes

#### Updated: `src/frontend/src/pages/Analyze.jsx`
- Added `githubUrl` state for storing the GitHub URL
- Modified `analysisMode` to support three modes: `'single'`, `'project'`, `'github'`
- Added mode tabs to switch between:
  - **Paste Code**: Direct code input
  - **Upload Project**: ZIP file upload
  - **GitHub Repository**: GitHub URL input
- Conditional rendering for different input types
- Updated submit handler to call `analysisAPI.submitGithub()` for GitHub mode
- Dynamic button labels and disabled states based on mode

#### Updated: `src/frontend/src/api.js`
- Added `submitGithub(target, repoUrl)` method to `analysisAPI`
- Sends POST request to `/api/analyze/github`

## Usage

### For Users
1. Navigate to the **Analyze Code** page
2. Click on the **GitHub Repository** tab
3. Paste the GitHub repository URL (e.g., `https://github.com/facebook/react`)
4. Click **Analyze Repository**
5. The system will:
   - Clone the repository
   - Extract all JavaScript files (up to 2MB total)
   - Scan for XSS vulnerabilities
   - Display results with severity levels and recommendations

### Supported URL Formats
- `https://github.com/username/repository`
- `https://github.com/username/repository/`
- `https://www.github.com/username/repository`

### Limitations
- Individual JavaScript files: max 50KB each
- Total repository size: max 2MB of JavaScript code
- Shallow clone (latest commit only) for performance
- Requires public repositories (no authentication support yet)

## How It Works

1. **URL Validation**: Validates that the provided URL is a valid GitHub repository URL
2. **Repository Cloning**: Uses `simple-git` to shallow clone the repository to a temporary directory
3. **File Extraction**: Recursively walks through the cloned repo, collecting JavaScript files while:
   - Excluding common non-source directories
   - Enforcing file and total size limits
4. **Vulnerability Scanning**: Uses the existing `scanCode()` function to analyze each file
5. **Result Aggregation**: Combines findings from all files, calculating:
   - Average security score across all files
   - Total count of High/Medium/Low severity issues
   - Detailed findings with file locations
6. **Cleanup**: Removes the temporary clone directory
7. **Database Storage**: Stores the analysis result with `inputMode: "github"` for tracking

## Database Schema
The analysis is stored in the existing `Analysis` table with:
- `userId`: ID of the user who ran the analysis
- `target`: Always "dom-js" for vulnerability type
- `inputMode`: "github"
- `code`: Concatenated code from all analyzed files
- `scoreOverall`: Average security score
- `highCount`, `mediumCount`, `lowCount`: Vulnerability counts
- `reportJson`: Full analysis details including the original GitHub URL and file count

## Error Handling
The endpoint returns appropriate error messages for:
- Invalid GitHub URL format: `400 Bad Request`
- No JavaScript files found in repo: `400 Bad Request`
- Network or cloning errors: `500 Internal Server Error`
- Authentication errors: `401 Unauthorized`

## Performance Considerations
- Shallow cloning significantly reduces download time
- Temporary files are cleaned up after analysis
- Large files are skipped to prevent memory issues
- Recommended for repositories with reasonable amounts of JavaScript code

## Future Improvements
- Add support for private repositories with GitHub token authentication
- Support for language-specific vulnerability detection (not just JavaScript)
- Rate limiting to prevent abuse
- Caching of analyzed repositories
- Support for analyzing specific branches or tags
- Progress tracking for large repository analysis

