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
    const items = await getAllPlayers(); 
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

// Get players by team
router.get("/teams/:teamId/players", async (req, res) => {
  try { 
    const items = await getPlayersByTeam(req.params.teamId); 
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

// Get player by ID
router.get("/players/:id", async (req, res) => {
  try { 
    const item = await getPlayerById(req.params.id); 
    res.json({ success: true, data: item }); 
  }
  catch (err) { 
    res.status(404).json({ success: false, error: err.message }); 
  }
});

// Create new player (Admin only)
router.post("/players", authorizeRole("ADMIN"), async (req, res) => {
  try { 
    const created = await createPlayer(req.body); 
    res.status(201).json({ success: true, data: created }); 
  }
  catch (err) { 
    res.status(400).json({ success: false, error: err.message }); 
  }
});

// Update player (Admin only)
router.put("/players/:id", authorizeRole("ADMIN"), async (req, res) => {
  try { 
    const updated = await updatePlayer(req.params.id, req.body); 
    res.json({ success: true, data: updated }); 
  }
  catch (err) { 
    res.status(400).json({ success: false, error: err.message }); 
  }
});

// Delete player (Admin only)
router.delete("/players/:id", authorizeRole("ADMIN"), async (req, res) => {
  try { 
    const deleted = await deletePlayer(req.params.id); 
    res.json({ success: true, data: deleted }); 
  }
  catch (err) { 
    res.status(404).json({ success: false, error: err.message }); 
  }
});

export default router;

