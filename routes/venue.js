import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { 
  getAllVenues, 
  getVenueById, 
  createVenue, 
  updateVenue, 
  deleteVenue 
} from "../services/venueServices.js";

// const router = express.Router();
const router = express.Router();
router.use(authenticateToken);

// Get all venues
router.get("/venues", async (req, res) => {
  try { 
    console.log("Fetching all venues");
    const venues = await getAllVenues(); 
    console.log(venues);
    res.json({ 
      success: true, 
      count: venues.length, 
      data: venues 
    }); 
  }
  catch (err) { 
    res.status(500).json({ 
      success: false, 
      error: err.message 
    }); 
  }
});

// Get venue by ID
router.get("/venues/:id", async (req, res) => {
  try {
    const venue = await getVenueById(req.params.id); 
    res.json({ 
      success: true, 
      data: venue 
    }); 
  }
  catch (err) { 
    res.status(404).json({ 
      success: false, 
      error: err.message 
    }); 
  }
});

// Create new venue (Admin only)
router.post("/venues", authorizeRole("ADMIN"), async (req, res) => {
  try { 
    const created = await createVenue(req.body); 
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

// Update venue (Admin only)
router.put("/venues/:id", authorizeRole("ADMIN"), async (req, res) => {
  try { 
    const updated = await updateVenue(req.params.id, req.body); 
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

// Delete venue (Admin only)
router.delete("/venues/:id", authorizeRole("ADMIN"), async (req, res) => {
  try { 
    const deleted = await deleteVenue(req.params.id); 
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