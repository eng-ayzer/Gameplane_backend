// routes/result.js
import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import {
  getAllResults,
  getResultById,
  getResultByFixture,
  getResultsByLeague,
  getResultsByTeam,
  createResult,
  updateResult,
  updateResultByFixture,
  deleteResult,
  deleteResultByFixture,
  createResultAndUpdateFixture,
} from "../services/result.services.js";

const router = express.Router();
router.use(authenticateToken);

// Get all results
router.get("/results", async (req, res) => {
  try {
    const results = await getAllResults();
    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Get result by ID
router.get("/results/:id", async (req, res) => {
  try {
    const result = await getResultById(req.params.id);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      error: err.message,
    });
  }
});

// Get result by fixture ID
router.get("/fixtures/:fixtureId/result", async (req, res) => {
  try {
    const result = await getResultByFixture(req.params.fixtureId);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      error: err.message,
    });
  }
});

// Get results by league
router.get("/leagues/:leagueId/results", async (req, res) => {
  try {
    const results = await getResultsByLeague(req.params.leagueId);
    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Get results by team
router.get("/teams/:teamId/results", async (req, res) => {
  try {
    const results = await getResultsByTeam(req.params.teamId);
    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Create new result (Admin only)
router.post("/results", authorizeRole("ADMIN"), async (req, res) => {
  try {
    const created = await createResult(req.body);
    res.status(201).json({
      success: true,
      data: created,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

// Create result and update fixture status in one transaction (Admin only)
router.post("/fixtures/:fixtureId/result", authorizeRole("ADMIN"), async (req, res) => {
  try {
    const result = await createResultAndUpdateFixture(req.params.fixtureId, req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

// Update result by ID (Admin only)
router.put("/results/:id", authorizeRole("ADMIN"), async (req, res) => {
  try {
    const updated = await updateResult(req.params.id, req.body);
    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

// Update result by fixture ID (Admin only)
router.put("/fixtures/:fixtureId/result", authorizeRole("ADMIN"), async (req, res) => {
  try {
    const updated = await updateResultByFixture(req.params.fixtureId, req.body);
    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

// Delete result by ID (Admin only)
router.delete("/results/:id", authorizeRole("ADMIN"), async (req, res) => {
  try {
    const deleted = await deleteResult(req.params.id);
    res.json({
      success: true,
      data: deleted,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      error: err.message,
    });
  }
});

// Delete result by fixture ID (Admin only)
router.delete("/fixtures/:fixtureId/result", authorizeRole("ADMIN"), async (req, res) => {
  try {
    const deleted = await deleteResultByFixture(req.params.fixtureId);
    res.json({
      success: true,
      data: deleted,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      error: err.message,
    });
  }
});

export default router;


