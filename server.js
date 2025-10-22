import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

// Import routes
import userRoutes from "./routes/users.js";
import auth from './routes/auth.js'
import leagueRoutes from './routes/league.js'
import fixtureRoutes from './routes/fixture.js'
import resultRoutes from './routes/result.js'
import refereeRoutes from './routes/referee.js'
import playerRoutes from './routes/player.js'
import teamRoutes from './routes/team.js'
import coachRoutes from './routes/coach.js'
import venues from './routes/venue.js'


// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Mount API routes

app.use("/api", userRoutes);
app.use("/api/auth", auth)
app.use("/api", leagueRoutes)
app.use("/api", teamRoutes)      // Mount team routes first
app.use("/api", playerRoutes)    // Mount player routes second
app.use("/api", coachRoutes)     // Mount coach routes
app.use("/api", fixtureRoutes)   // Mount fixture routes last (has /teams/:id/fixtures)
app.use("/api", resultRoutes)
app.use("/api", refereeRoutes)
app.use("/api", venues);

// Protected route example


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

export default app;
