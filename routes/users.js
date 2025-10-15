import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../services/userServices.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";

const router = express.Router();

//  router.use(authenticateToken);

// GET all users (Admin only)
router.get("/users", authorizeRole("ADMIN"), async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET user by ID
router.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "ADMIN" && req.user.id !== id) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }
    const user = await getUserById(id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

// POST new user (Admin only)
router.post("/users", authorizeRole("ADMIN"), async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// UPDATE user
router.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "ADMIN" && req.user.id !== id) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }
    const updated = await updateUser(id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE user
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "ADMIN" && req.user.id !== id) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }
    const deleted = await deleteUser(id);
    res.json({ success: true, data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
