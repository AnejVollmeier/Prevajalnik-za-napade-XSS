const express = require("express");
const requireAuth = require("../middleware/auth");
const prisma = require("../db/prisma");

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const analyses = await prisma.analysis.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        createdAt: true,
        target: true,
        scoreOverall: true,
        highCount: true,
        mediumCount: true,
        lowCount: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(analyses);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const analysis = await prisma.analysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    if (analysis.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(
      Object.assign(analysis, { reportJson: JSON.parse(analysis.reportJson) }),
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
