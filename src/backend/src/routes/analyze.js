const express = require("express");
const z = require("zod");
const requireAuth = require("../middleware/auth");
const prisma = require("../db/prisma");
const { scanCode } = require("../analyzer/scan");

const router = express.Router();

const analyzeSchema = z.object({
  target: z.literal("dom-js"),
  inputMode: z.literal("paste"),
  code: z.string().max(200000, "Code is too large (max 200k chars)"),
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

module.exports = router;
