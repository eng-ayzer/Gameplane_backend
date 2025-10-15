import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "firstName, lastName, email and password are required",
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role === "ADMIN" ? "ADMIN" : "COACH",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || "mysecret",
      { expiresIn: "48h" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: newUser,
        token,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: err.message,
    });
  }
});

//  LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email and password and role are required",
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: user.id, role:user.role },
      process.env.JWT_SECRET || "mysecret",
      { expiresIn: "24h" }
    );

    const { password: _, ...userData } = user;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error during login",
      error: error.message,
    });
  }
});

 //DELETE USER (self or admin)

// router.delete("/delete/:id", authenticateToken, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const requester = req.user;

//     if (requester.role !== "ADMIN" && requester.id !== id) {
//       return res.status(403).json({
//         success: false,
//         message: "Access denied: you can only delete your own account",
//       });
//     }

//     const existingUser = await prisma.user.findUnique({ where: { id } });
//     if (!existingUser) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     await prisma.user.delete({ where: { id } });

//     res.status(200).json({
//       success: true,
//       message: "User deleted successfully",
//     });
//   } catch (err) {
//     console.error("Delete user error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Error deleting user",
//       error: err.message,
//     });
//   }
// });

export default router;
