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

    // Generate default name
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate()} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    const defaultName = `Pasted Code - ${dateStr}`;

     const analysis = await prisma.analysis.create({
       data: {
         userId: req.user.id,
         name: defaultName,
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

    // Calculate risk score based on vulnerability count and severity
    // This properly reflects actual risk instead of penalizing large projects
    let scoreOverall = 0;
    
    if (allFindings.length > 0) {
      // Count findings by severity
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

    // Store the combined code as concatenated files
    const fullCode = combinedCode.join('\n\n');

    // Generate default name
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate()} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    const defaultName = `${projectName} - ${dateStr}`;

    const analysis = await prisma.analysis.create({
      data: {
        userId: req.user.id,
        name: defaultName,
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

    // Generate default name
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate()} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    const defaultName = `${gitHubResult.projectName} - ${dateStr}`;

    // Store in database
    const analysis = await prisma.analysis.create({
      data: {
        userId: req.user.id,
        name: defaultName,
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
