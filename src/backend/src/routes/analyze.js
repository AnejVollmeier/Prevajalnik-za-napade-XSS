const express = require("express");
const z = require("zod");
const requireAuth = require("../middleware/auth");
const prisma = require("../db/prisma");
const { scanCode } = require("../analyzer/scan");
const { analyzeGitHubRepo } = require("../analyzer/githubAnalyzer");

const router = express.Router();

const analyzeSchema = z.object({
  target: z.literal("dom-js"),
  inputMode: z.literal("paste"),
  code: z.string().max(200000, "Code is too large (max 200k chars)"),
});

const projectAnalyzeSchema = z.object({
  target: z.literal("dom-js"),
  projectName: z.string(),
  files: z.record(z.string()), // {filename: code}
});

const githubAnalyzeSchema = z.object({
  target: z.literal("dom-js"),
  repoUrl: z.string().url("Invalid URL"),
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const parsed = analyzeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.issues });
    }

    const { target, inputMode, code } = parsed.data;

    const scanResult = scanCode({ code });

     const analysis = await prisma.analysis.create({
       data: {
         userId: req.user.id,
         target,
         inputMode,
         code, // Save the original code
         scoreOverall: scanResult.scoreOverall,
         highCount: scanResult.summary.high,
         mediumCount: scanResult.summary.medium,
         lowCount: scanResult.summary.low,
         reportJson: JSON.stringify({
           target,
           inputMode,
           scoreOverall: scanResult.scoreOverall,
           summary: scanResult.summary,
           findings: scanResult.findings,
         }),
       },
     });

    res.json({
      analysisId: analysis.id,
      target,
      inputMode,
      scoreOverall: scanResult.scoreOverall,
      summary: scanResult.summary,
      findings: scanResult.findings,
    });
  } catch (error) {
    next(error);
  }
});

// Project analysis endpoint
router.post("/project", requireAuth, async (req, res, next) => {
  try {
    const parsed = projectAnalyzeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.issues });
    }

    const { target, projectName, files } = parsed.data;

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
    const scoreOverall = Math.min(100, Math.floor(totalScore / Object.keys(files).length));

    // Store the combined code as concatenated files
    const fullCode = combinedCode.join('\n\n');

    const analysis = await prisma.analysis.create({
      data: {
        userId: req.user.id,
        target,
        inputMode: "project",
        code: fullCode,
        scoreOverall,
        highCount,
        mediumCount,
        lowCount,
        reportJson: JSON.stringify({
          target,
          inputMode: "project",
          projectName,
          fileCount: Object.keys(files).length,
          scoreOverall,
          summary: { high: highCount, medium: mediumCount, low: lowCount },
          findings: allFindings,
        }),
      },
    });

     res.json({
       analysisId: analysis.id,
       target,
       inputMode: "project",
       projectName,
       fileCount: Object.keys(files).length,
       scoreOverall,
       summary: { high: highCount, medium: mediumCount, low: lowCount },
       findings: allFindings,
     });
   } catch (error) {
     next(error);
   }
 });

// GitHub repository analysis endpoint
router.post("/github", requireAuth, async (req, res, next) => {
  try {
    const parsed = githubAnalyzeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.issues });
    }

    const { target, repoUrl } = parsed.data;

    // Analyze GitHub repository
    const gitHubResult = await analyzeGitHubRepo(repoUrl);

    // Store in database
    const analysis = await prisma.analysis.create({
      data: {
        userId: req.user.id,
        target,
        inputMode: "github",
        code: gitHubResult.fullCode,
        scoreOverall: gitHubResult.scoreOverall,
        highCount: gitHubResult.summary.high,
        mediumCount: gitHubResult.summary.medium,
        lowCount: gitHubResult.summary.low,
        reportJson: JSON.stringify({
          target,
          inputMode: "github",
          projectName: gitHubResult.projectName,
          repoUrl,
          fileCount: gitHubResult.fileCount,
          scoreOverall: gitHubResult.scoreOverall,
          summary: gitHubResult.summary,
          findings: gitHubResult.findings,
        }),
      },
    });

    res.json({
      analysisId: analysis.id,
      target,
      inputMode: "github",
      projectName: gitHubResult.projectName,
      repoUrl,
      fileCount: gitHubResult.fileCount,
      scoreOverall: gitHubResult.scoreOverall,
      summary: gitHubResult.summary,
      findings: gitHubResult.findings,
    });
  } catch (error) {
    console.error("GitHub analysis error:", error);
    if (error.message.includes("Invalid GitHub URL")) {
      return res.status(400).json({ error: "Invalid GitHub repository URL" });
    }
    if (error.message.includes("No JavaScript files found")) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

module.exports = router;
