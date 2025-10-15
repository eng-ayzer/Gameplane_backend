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
    const items = await getAllTeams(); 
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
    const item = await getTeamById(req.params.id); 
    res.json({ success: true, data: item }); 
  }
  catch (err) { 
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

// Update team (Admin only)
router.put("/teams/:id", authorizeRole("ADMIN"), async (req, res) => {
  try { 
    const updated = await updateTeam(req.params.id, req.body); 
    res.json({ success: true, data: updated }); 
  }
  catch (err) { 
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

