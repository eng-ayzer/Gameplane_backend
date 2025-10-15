import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { getAllReferees, getRefereeById, createReferee, updateReferee, deleteReferee } from "../services/refereeServices.js";

const router = express.Router();
router.use(authenticateToken);

router.get("/referees", async (req, res) => {
  try { const items = await getAllReferees();
     res.json({
       success: true, 
       count: items.length, 
       data: items 
      }); 
    }
  catch (err) { 
    res.status(500).json({ success: false, error: err.message }); }
});

router.get("/referees/:id", async (req, res) => {
  try { const item = await getRefereeById(req.params.id); 
    res.json({
    
    success: true, data: item }); }
  catch (err) {
     res.status(404).json({ success: false, error: err.message }); }
});

router.post("/referees", authorizeRole("ADMIN"), async (req, res) => {
  try { const created = await createReferee(req.body); res.status(201).json({ success: true, data: created }); }
  catch (err) { res.status(400).json({ success: false, error: err.message }); }
});

router.put("/referees/:id", authorizeRole("ADMIN"), async (req, res) => {
  try { const updated = await updateReferee(req.params.id, req.body); res.json({ success: true, data: updated }); }
  catch (err) { res.status(400).json({ success: false, error: err.message }); }
});

router.delete("/referees/:id", authorizeRole("ADMIN"), async (req, res) => {
  try { const deleted = await deleteReferee(req.params.id); res.json({ success: true, data: deleted }); }
  catch (err) { res.status(404).json({ success: false, error: err.message }); }
});

export default router;

