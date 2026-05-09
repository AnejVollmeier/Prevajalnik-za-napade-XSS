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

// Extract JavaScript files recursively
async function extractJsFiles(dirPath) {
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
    ".test.js",
    ".spec.js",
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

  let totalSize = 0;

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
          entry.name.endsWith(".js") &&
          totalSize < maxTotalSize
        ) {
          try {
            const content = fs.readFileSync(fullPath, "utf-8");
            if (content.length <= maxFileSize) {
              files[relativePath] = content;
              totalSize += content.length;
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
  return files;
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

    // Extract JS files
    console.log("Extracting JavaScript files...");
    const files = await extractJsFiles(tempDir);

    if (Object.keys(files).length === 0) {
      throw new Error(
        "No JavaScript files found in the repository (excluding node_modules, dist, etc.)",
      );
    }

    // Analyze all files and combine results
    let totalScore = 0;
    let allFindings = [];
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    const combinedCode = [];

    for (const [filename, code] of Object.entries(files)) {
      const scanResult = scanCode({ code });

      // Add filename to findings
      const findingsWithFile = scanResult.findings.map((finding) => ({
        ...finding,
        file: filename,
      }));

      allFindings = allFindings.concat(findingsWithFile);
      totalScore += scanResult.scoreOverall;
      highCount += scanResult.summary.high;
      mediumCount += scanResult.summary.medium;
      lowCount += scanResult.summary.low;

      combinedCode.push(`// File: ${filename}\n${code}`);
    }

    // Calculate average score
    const scoreOverall = Math.min(
      100,
      Math.floor(totalScore / Object.keys(files).length),
    );
    const fullCode = combinedCode.join("\n\n");

    const repoInfo = extractRepoInfo(repoUrl);

    return {
      success: true,
      projectName: repoInfo.repo,
      fileCount: Object.keys(files).length,
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

