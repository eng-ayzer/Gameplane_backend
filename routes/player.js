import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { 
  getAllPlayers, 
  getPlayerById, 
  getPlayersByTeam, 
  createPlayer, 
  updatePlayer, 
  deletePlayer 
} from "../services/playerServices.js";

const router = express.Router();
router.use(authenticateToken);

// Get all players
router.get("/players", async (req, res) => {
  try {
    // Admins see all players; coaches see only players in their team
    if (req.user.role === "ADMIN") {
      const items = await getAllPlayers();
      return res.json({ success: true, count: items.length, data: items });
    }

    if (req.user.role === "COACH") {
      const teamId = req.coach?.team_id;
      if (!teamId) return res.json({ success: true, count: 0, data: [] });
      const items = await getPlayersByTeam(teamId);
      return res.json({ success: true, count: items.length, data: items });
    }

    return res.status(403).json({ success: false, message: "Access denied" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get players by team
router.get("/teams/:teamId/players", async (req, res) => {
  try {
    const teamId = req.params.teamId;
    if (req.user.role === "ADMIN") {
      const items = await getPlayersByTeam(teamId);
      return res.json({ success: true, count: items.length, data: items });
    }

    if (req.user.role === "COACH") {
      if (req.coach?.team_id !== teamId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
      const items = await getPlayersByTeam(teamId);
      return res.json({ success: true, count: items.length, data: items });
    }

    return res.status(403).json({ success: false, message: "Access denied" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get player by ID
router.get("/players/:id", async (req, res) => {
  try {
    const item = await getPlayerById(req.params.id);

    if (req.user.role === "ADMIN") {
      return res.json({ success: true, data: item });
    }

    if (req.user.role === "COACH") {
      if (!req.coach || item.team_id !== req.coach.team_id) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
      return res.json({ success: true, data: item });
    }

    return res.status(403).json({ success: false, message: "Access denied" });

  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});

// Create new player (Admin or Coach for their team)
router.post("/players", async (req, res) => {
  try {
    if (req.user.role === "ADMIN") {
      const created = await createPlayer(req.body);
      return res.status(201).json({ success: true, data: created });
    }

    if (req.user.role === "COACH") {
      const teamId = req.coach?.team_id;
      if (!teamId || req.body.team_id !== teamId) {
        return res.status(403).json({ success: false, message: "Coaches can only add players to their own team" });
      }
      const created = await createPlayer(req.body);
      return res.status(201).json({ success: true, data: created });
    }

    return res.status(403).json({ success: false, message: "Access denied" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Update player (Admin or Coach for their team)
router.put("/players/:id", async (req, res) => {
  try {
    if (req.user.role === "ADMIN") {
      const updated = await updatePlayer(req.params.id, req.body);
      return res.json({ success: true, data: updated });
    }

    if (req.user.role === "COACH") {
      const existing = await getPlayerById(req.params.id);
      if (!req.coach || existing.team_id !== req.coach.team_id) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
      // Prevent coach from moving player to another team
      if (req.body.team_id && req.body.team_id !== req.coach.team_id) {
        return res.status(403).json({ success: false, message: "Cannot move player to another team" });
      }
      const updated = await updatePlayer(req.params.id, req.body);
      return res.json({ success: true, data: updated });
    }

    return res.status(403).json({ success: false, message: "Access denied" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Delete player (Admin or Coach for their team)
router.delete("/players/:id", async (req, res) => {
  try {
    if (req.user.role === "ADMIN") {
      const deleted = await deletePlayer(req.params.id);
      return res.json({ success: true, data: deleted });
    }

    if (req.user.role === "COACH") {
      const existing = await getPlayerById(req.params.id);
      if (!req.coach || existing.team_id !== req.coach.team_id) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
      const deleted = await deletePlayer(req.params.id);
      return res.json({ success: true, data: deleted });
    }

    return res.status(403).json({ success: false, message: "Access denied" });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});

export default router;

