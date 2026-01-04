import express from "express";
import { runESLint } from "../tools/eslintRunner.js";
import { runSemgrep } from "../tools/semgrepRunner.js";
import { writeFiles } from "../utils/writeFiles.js";
import { cleanup } from "../utils/cleanup.js";
import { v4 as uuid } from "uuid";

const router = express.Router();

router.post("/secrets", async (req, res) => {
  const scanId = uuid();
  const scanPath = `scans/${scanId}`;

  try {
    await writeFiles(scanPath, req.body.files);
    const result = await runSemgrep(scanPath);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    cleanup(scanPath);
  }
});

router.post("/lint", async (req, res) => {
  const scanId = uuid();
  const scanPath = `scans/${scanId}`;

  try {
    await writeFiles(scanPath, req.body.files);
    const result = await runESLint(scanPath);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    cleanup(scanPath);
  }
});

export default router;
