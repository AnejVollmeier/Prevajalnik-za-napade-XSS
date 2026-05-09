const express = require("express");
const z = require("zod");
const requireAuth = require("../middleware/auth");
const prisma = require("../db/prisma");

const router = express.Router();

// Schema for updating analysis name
const updateAnalysisSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const analyses = await prisma.analysis.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        name: true,
        createdAt: true,
        target: true,
        inputMode: true,
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

// Update analysis name
router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const parsed = updateAnalysisSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.issues });
    }

    // Check if analysis exists and belongs to user
    const analysis = await prisma.analysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    if (analysis.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Update the analysis
    const updated = await prisma.analysis.update({
      where: { id },
      data: { name: parsed.data.name },
      select: {
        id: true,
        name: true,
        createdAt: true,
        target: true,
        inputMode: true,
        scoreOverall: true,
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Delete analysis
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    // Check if analysis exists and belongs to user
    const analysis = await prisma.analysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    if (analysis.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Delete the analysis
    await prisma.analysis.delete({
      where: { id },
    });

    res.json({ success: true, message: "Analysis deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
