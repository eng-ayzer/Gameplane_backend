import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { 
  getAllCoaches, 
  getCoachById, 
  getCoachesByTeam, 
  createCoach, 
  updateCoach, 
  deleteCoach 
} from "../services/coachServices.js";

const router = express.Router();
router.use(authenticateToken);

// Get all coaches
router.get("/coaches", async (req, res) => {
  try { 
    const coaches = await getAllCoaches(); 
    res.json({ 
      success: true, 
      count: coaches.length, 
      data: coaches 
    }); 
  }
  catch (err) { 
    res.status(500).json({ 
      success: false, 
      error: err.message 
    }); 
  }
});

// Get coaches by team
router.get("/teams/:teamId/coaches", async (req, res) => {
  try { 
    const coaches = await getCoachesByTeam(req.params.teamId); 
    res.json({ 
      success: true, 
      count: coaches.length, 
      data: coaches 
    }); 
  }
  catch (err) { 
    res.status(500).json({ 
      success: false, 
      error: err.message 
    }); 
  }
});

// Get coach by ID
router.get("/coaches/:id", async (req, res) => {
  try { 
    const coach = await getCoachById(req.params.id); 
    res.json({ 
      success: true, 
      data: coach 
    }); 
  }
  catch (err) { 
    res.status(404).json({ 
      success: false, 
      error: err.message 
    }); 
  }
});

// Create new coach (Admin only)
router.post("/coaches", authorizeRole("ADMIN"), async (req, res) => {
  try { 
    const created = await createCoach(req.body); 
    res.status(201).json({ 
      success: true, 
      data: created 
    }); 
  }
  catch (err) { 
    res.status(400).json({ 
      success: false, 
      error: err.message 
    }); 
  }
});

// Update coach (Admin only)
router.put("/coaches/:id", authorizeRole("ADMIN"), async (req, res) => {
  try { 
    const updated = await updateCoach(req.params.id, req.body); 
    res.json({ 
      success: true, 
      data: updated 
    }); 
  }
  catch (err) { 
    res.status(400).json({ 
      success: false, 
      error: err.message 
    }); 
  }
});

// Delete coach (Admin only)
router.delete("/coaches/:id", authorizeRole("ADMIN"), async (req, res) => {
  try { 
    const deleted = await deleteCoach(req.params.id); 
    res.json({ 
      success: true, 
      data: deleted 
    }); 
  }
  catch (err) { 
    res.status(404).json({ 
      success: false, 
      error: err.message 
    }); 
  }
});

export default router;
