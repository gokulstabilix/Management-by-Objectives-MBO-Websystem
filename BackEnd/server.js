const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const env = require("./src/config/env");
const connectDB = require("./src/config/db");
const routes = require("./src/routes");
const { errorHandler, notFound } = require("./src/middleware/errorHandler");

// ── Connect to MongoDB Atlas ──
connectDB();

const app = express();

// ── Security headers ──
app.use(helmet());

// ── CORS ──
app.use(
  cors({
    origin: [env.CORS_ORIGIN, "http://localhost:5173"],
    credentials: true,
  }),
);

// ── Rate limiting on auth routes ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  message: {
    status: "fail",
    message: "Too many requests. Please try again later.",
  },
});
app.use("/api/auth", authLimiter);

// ── Body parsers ──
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ── Request logging ──
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Health check ──
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "UP", message: "MBO Backend is running!" });
});

// ── API routes ──
app.use("/api", routes);

// ── 404 + global error handler ──
app.use(notFound);
app.use(errorHandler);

// ── Start server ──
const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 MBO Server running on port ${PORT} [${env.NODE_ENV}]`);
});

module.exports = app;
