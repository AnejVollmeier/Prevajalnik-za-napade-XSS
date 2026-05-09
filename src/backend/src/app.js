const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const analyzeRoutes = require("./routes/analyze");
const analysesRoutes = require("./routes/analyses");
const foldersRoutes = require("./routes/folders");

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "250kb" }));

app.use("/api/auth", authRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/analyses", analysesRoutes);
app.use("/api/folders", foldersRoutes);

// Centralni error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Payload Too Large" });
  }
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
