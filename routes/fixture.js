// routes/fixture.js
import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import {
  getAllFixtures,
  getFixtureById,
  getFixturesByLeague,
  getFixturesByTeam,
  getFixturesByDateRange,
  createFixture,
  updateFixture,
  updateFixtureStatus,
  deleteFixture,
} from "../services/fixture.services.js";

const router = express.Router();
router.use(authenticateToken);

// Get all fixtures
router.get("/fixtures", async (req, res) => {
  try {
    const fixtures = await getAllFixtures();
    res.json({
      success: true,
      count: fixtures.length,
      data: fixtures,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Get fixture by ID
router.get("/fixtures/:id", async (req, res) => {
  try {
    const fixture = await getFixtureById(req.params.id);
    res.json({
      success: true,
      data: fixture,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      error: err.message,
    });
  }
});

// Get fixtures by league
router.get("/leagues/:leagueId/fixtures", async (req, res) => {
  try {
    const fixtures = await getFixturesByLeague(req.params.leagueId);
    res.json({
      success: true,
      count: fixtures.length,
      data: fixtures,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Get fixtures by team
router.get("/teams/:teamId/fixtures", async (req, res) => {
  try {
    const fixtures = await getFixturesByTeam(req.params.teamId);
    res.json({
      success: true,
      count: fixtures.length,
      data: fixtures,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Get fixtures by date range
router.get("/fixtures/date-range", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "Start date and end date are required",
      });
    }

    const fixtures = await getFixturesByDateRange(startDate, endDate);
    res.json({
      success: true,
      count: fixtures.length,
      data: fixtures,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Create new fixture (Admin only)
router.post("/fixtures", authorizeRole("ADMIN"), async (req, res) => {
  try {
    const created = await createFixture(req.body);
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

// Update fixture (Admin only)
router.put("/fixtures/:id", authorizeRole("ADMIN"), async (req, res) => {
  try {
    const updated = await updateFixture(req.params.id, req.body);
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

// Update fixture status only (Admin only)
router.patch("/fixtures/:id/status", authorizeRole("ADMIN"), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !["Scheduled", "Completed", "Postponed"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Valid status is required (Scheduled, Completed, Postponed)",
      });
    }

    const updated = await updateFixtureStatus(req.params.id, status);
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

// Delete fixture (Admin only)
router.delete("/fixtures/:id", authorizeRole("ADMIN"), async (req, res) => {
  try {
    const deleted = await deleteFixture(req.params.id);
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


