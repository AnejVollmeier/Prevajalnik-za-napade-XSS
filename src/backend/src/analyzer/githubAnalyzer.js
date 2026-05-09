      const fs = require("fs");
const path = require("path");
const os = require("os");
const simpleGit = require("simple-git");
const { scanCode } = require("./scan");

// Validate GitHub URL
function isValidGithubUrl(url) {
  const githubRegex =
    /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
  return githubRegex.test(url);
}

// Extract repo owner and name from URL
function extractRepoInfo(url) {
  const match = url.match(/github\.com\/([\w-]+)\/([\w.-]+)\/?$/);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2],
  };
}

// Supported file extensions for analysis
const SUPPORTED_EXTENSIONS = [
  ".js",    // JavaScript
  ".ts",    // TypeScript
  ".tsx",   // TypeScript React
  ".jsx",   // JavaScript React
  ".py",    // Python
  ".cs",    // C#
  ".java",  // Java
  ".go",    // Go
  ".rb",    // Ruby
  ".php",   // PHP
  ".cpp",   // C++
  ".c",     // C
  ".rs",    // Rust
  ".swift", // Swift
  ".kt",    // Kotlin
];

// Extract source code files recursively
async function extractSourceFiles(dirPath) {
  const files = {};
  const maxFileSize = 50000; // 50KB per file
  const maxTotalSize = 2000000; // 2MB total

  // Patterns to exclude
  const excludePatterns = [
    "node_modules",
    ".git",
    "dist",
    "build",
    ".venv",
    "env",
    "__pycache__",
    ".next",
    ".nuxt",
    ".cache",
    ".github",
    ".vscode",
    ".idea",
    "coverage",
    "test",
    "tests",
    ".test.",
    ".spec.",
    "fixtures",
    "mock",
    ".min.js",
    "vendor",
    ".bundle",
  ];

  const shouldExclude = (filePath) => {
    return excludePatterns.some(
      (pattern) =>
        filePath.includes(`\\${pattern}\\`) ||
        filePath.includes(`/${pattern}/`) ||
        filePath.includes(`\\${pattern}`) ||
        filePath.includes(`/${pattern}`),
    );
  };

  const isSupportedFile = (filename) => {
    return SUPPORTED_EXTENSIONS.some((ext) => filename.toLowerCase().endsWith(ext));
  };

  let totalSize = 0;
  let fileCount = 0;

  function walkDir(dir, relativeDir = "") {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = relativeDir
          ? `${relativeDir}/${entry.name}`
          : entry.name;

        if (shouldExclude(fullPath)) continue;

        if (entry.isDirectory()) {
          walkDir(fullPath, relativePath);
        } else if (
          entry.isFile() &&
          isSupportedFile(entry.name) &&
          totalSize < maxTotalSize
        ) {
          try {
            const content = fs.readFileSync(fullPath, "utf-8");
            if (content.length <= maxFileSize && content.trim().length > 0) {
              files[relativePath] = content;
              totalSize += content.length;
              fileCount++;
            }
          } catch (err) {
            console.warn(`Failed to read file: ${fullPath}`, err.message);
          }
        }
      }
    } catch (err) {
      console.warn(`Failed to read directory: ${dir}`, err.message);
    }
  }

  walkDir(dirPath);
  return { files, fileCount, totalSize };
}

// Analyze GitHub repository
async function analyzeGitHubRepo(repoUrl) {
  const tempDir = path.join(os.tmpdir(), `github-analysis-${Date.now()}`);
  let git;

  try {
    // Validate URL
    if (!isValidGithubUrl(repoUrl)) {
      throw new Error("Invalid GitHub URL format");
    }

    // Create temp directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Clone repository
    console.log(`Cloning repository: ${repoUrl}`);
    git = simpleGit();
    await git.clone(repoUrl, tempDir, { "--depth": 1 }); // Only clone latest commit to be faster

    // Extract source code files (supports multiple languages)
    console.log("Extracting source code files...");
    const { files, fileCount, totalSize } = await extractSourceFiles(tempDir);

    if (fileCount === 0) {
      throw new Error(
        "No source code files found in the repository. Supported languages: JavaScript, TypeScript, Python, Java, C#, Go, Ruby, PHP, C/C++, Rust, Swift, Kotlin (excluding node_modules, dist, build, etc.)",
      );
    }

    console.log(`Found ${fileCount} source files (${Math.round(totalSize / 1024)}KB total)`);

    // Analyze all files and combine results
    let totalScore = 0;
    let allFindings = [];
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    const combinedCode = [];
    let filesWithVulnerabilities = 0;

    for (const [filename, code] of Object.entries(files)) {
      const scanResult = scanCode({ code });

      // Add filename to findings
      const findingsWithFile = scanResult.findings.map((finding) => ({
        ...finding,
        file: filename,
      }));

      allFindings = allFindings.concat(findingsWithFile);
      totalScore += scanResult.scoreOverall;
      
      if (scanResult.findings.length > 0) {
        filesWithVulnerabilities++;
      }
      
      highCount += scanResult.summary.high;
      mediumCount += scanResult.summary.medium;
      lowCount += scanResult.summary.low;

      combinedCode.push(`// File: ${filename}\n${code}`);
    }

    // Calculate risk score based on vulnerability count and severity
    // This properly reflects actual risk instead of penalizing large repos
    let scoreOverall = 0;
    
    if (allFindings.length > 0) {
      // Base score: each finding contributes to overall risk
      const criticalCount = allFindings.filter(f => f.severity === "Critical").length;
      const highCount_findings = allFindings.filter(f => f.severity === "High").length;
      const mediumCount_findings = allFindings.filter(f => f.severity === "Medium").length;
      const lowCount_findings = allFindings.filter(f => f.severity === "Low").length;
      
      // Score calculation:
      // Critical: 40 points each (max impact)
      // High: 25 points each
      // Medium: 10 points each
      // Low: 2 points each
      const riskScore = (criticalCount * 40) + (highCount_findings * 25) + (mediumCount_findings * 10) + (lowCount_findings * 2);
      
      // Normalize to 0-100 scale
      // With aggressive scaling: ~5 critical issues = 100%
      scoreOverall = Math.min(100, Math.floor((riskScore / 200) * 100));
    }
    
    const fullCode = combinedCode.join("\n\n");

    const repoInfo = extractRepoInfo(repoUrl);

    return {
      success: true,
      projectName: repoInfo.repo,
      fileCount,
      scoreOverall,
      summary: { high: highCount, medium: mediumCount, low: lowCount },
      findings: allFindings,
      fullCode,
    };
  } catch (error) {
    console.error("GitHub analysis error:", error);
    throw error;
  } finally {
    // Cleanup temp directory
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (err) {
      console.warn(`Failed to cleanup temp directory: ${tempDir}`, err.message);
    }
  }
}

module.exports = {
  analyzeGitHubRepo,
  isValidGithubUrl,
};

