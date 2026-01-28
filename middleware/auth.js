import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

//  Verify token and attach user
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "mysecret"
    );

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token - user not found",
      });
    }

    req.user = user;
    // If the authenticated user is a coach, attach their Coach profile
    if (req.user && req.user.role === "COACH") {
      const coach = await prisma.coach.findUnique({ where: { email: req.user.email } });
      if (!coach) {
        return res.status(403).json({ success: false, message: "Coach profile not found" });
      }
      req.coach = coach; // attach full coach record (includes team_id)
    }
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

//  Restrict access by role
export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: insufficient permissions",
      });
    }
    next();
  };
};
