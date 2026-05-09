const express = require("express");
const router = express.Router();
const prisma = require("../db/prisma");
const requireAuth = require("../middleware/auth");

// Pridobi vse mape za uporabnika
router.get("/", requireAuth, async (req, res) => {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(folders);
  } catch (error) {
    console.error("Napaka pri pridobivanju map:", error);
    res.status(500).json({ error: "Napaka pri pridobivanju map" });
  }
});

// Ustvari novo mapo
router.post("/", requireAuth, async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Ime mape je obvezno" });
  }

  try {
    const folder = await prisma.folder.create({
      data: {
        name,
        userId: req.user.id,
      },
    });
    res.status(201).json(folder);
  } catch (error) {
    console.error("Napaka pri ustvarjanju mape:", error);
    res.status(500).json({ error: "Napaka pri ustvarjanju mape" });
  }
});

// Posodobi (preimenuj) mapo
router.put("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Ime mape je obvezno" });
  }

  try {
    const existing = await prisma.folder.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: "Mapa ni najdena" });
    }

    const updated = await prisma.folder.update({
      where: { id: parseInt(id) },
      data: { name },
    });
    res.json(updated);
  } catch (error) {
    console.error("Napaka posodabljanju mape:", error);
    res.status(500).json({ error: "Napaka posodabljanju mape" });
  }
});

// Izbrisi mapo
router.delete("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.folder.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: "Mapa ni najdena" });
    }

    // Odstranimo folderId vsem analizam v tej mapi
    await prisma.analysis.updateMany({
      where: { folderId: parseInt(id) },
      data: { folderId: null },
    });

    await prisma.folder.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Napaka pri brisanju mape:", error);
    res.status(500).json({ error: "Napaka pri brisanju mape" });
  }
});

module.exports = router;
