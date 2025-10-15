// routes/leagueRoutes.js
import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import {
  getAllLeagues,
  getLeagueById,
  createLeague,
  updateLeague,
  deleteLeague,
} from "../services/league.services.js";

const router = express.Router();
router.use(authenticateToken);

router.get("/leagues", async (req, res) => {
  try {
    const leagues = await getAllLeagues();
    res.json({
      success: true,
      count: leagues.length,
      data: leagues,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

router.get("/leagues/:id", async (req, res) => {
  try {
    const league = await getLeagueById(req.params.id);
    res.json({
      success: true,
      data: league,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      error: err.message,
    });
  }
});

router.post("/leagues", authorizeRole("ADMIN"), async (req, res) => {
  try {
    const created = await createLeague(req.body);
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

router.put("/leagues/:id", authorizeRole("ADMIN"), async (req, res) => {
  try {
    const updated = await updateLeague(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

router.delete("/leagues/:id", authorizeRole("ADMIN"), async (req, res) => {
  try {
    const deleted = await deleteLeague(req.params.id);
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
