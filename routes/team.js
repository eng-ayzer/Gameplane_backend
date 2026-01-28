import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { 
  getAllTeams, 
  getTeamById, 
  getTeamsByLeague, 
  createTeam, 
  updateTeam, 
  deleteTeam 
} from "../services/teamServices.js";

const router = express.Router();
router.use(authenticateToken);

// Get all teams
router.get("/teams", async (req, res) => {
  try {
    // Admins see all teams; coaches see only their assigned team
    if (req.user.role === "ADMIN") {
      const items = await getAllTeams();
      return res.json({ success: true, count: items.length, data: items });
    }

    if (req.user.role === "COACH") {
      const teamId = req.coach?.team_id;
      if (!teamId) return res.json({ success: true, count: 0, data: [] });
      const item = await getTeamById(teamId);
      return res.json({ success: true, count: 1, data: [item] });
    }

    return res.status(403).json({ success: false, message: "Access denied" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get teams by league
router.get("/leagues/:leagueId/teams", async (req, res) => {
  try { 
    const items = await getTeamsByLeague(req.params.leagueId); 
    res.json({ 
      success: true, 
      count: items.length, 
      data: items 
    }); 
  }
  catch (err) { 
    res.status(500).json({ success: false, error: err.message }); 
  }
});

// Get team by ID
router.get("/teams/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (req.user.role === "ADMIN") {
      const item = await getTeamById(id);
      return res.json({ success: true, data: item });
    }

    if (req.user.role === "COACH") {
      if (req.coach?.team_id !== id) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
      const item = await getTeamById(id);
      return res.json({ success: true, data: item });
    }

    return res.status(403).json({ success: false, message: "Access denied" });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});

// Create new team (Admin only)
router.post("/teams", authorizeRole("ADMIN"), async (req, res) => {
  try { 
    const created = await createTeam(req.body); 
    res.status(201).json({ success: true, data: created }); 
  }
  catch (err) { 
    res.status(400).json({ success: false, error: err.message }); 
  }
});

// Update team (Admin or Coach for their own team)
router.put("/teams/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (req.user.role === "ADMIN") {
      const updated = await updateTeam(id, req.body);
      return res.json({ success: true, data: updated });
    }

    if (req.user.role === "COACH") {
      if (req.coach?.team_id !== id) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
      const updated = await updateTeam(id, req.body);
      return res.json({ success: true, data: updated });
    }

    return res.status(403).json({ success: false, message: "Access denied" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Delete team (Admin only)
router.delete("/teams/:id", authorizeRole("ADMIN"), async (req, res) => {
  try { 
    const deleted = await deleteTeam(req.params.id); 
    res.json({ success: true, data: deleted }); 
  }
  catch (err) { 
    res.status(404).json({ success: false, error: err.message }); 
  }
});

export default router;

