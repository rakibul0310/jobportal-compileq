import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db";
import {
  errorHandler,
  handleUncaughtException,
  handleUnhandledRejection,
  notFoundHandler,
} from "./middlewares/errorHandler";
import { handleSocketConnection } from "./sockets/socketHandlers";
import { handshake } from "./utils/handshake";

// Import routes
import adminRoutes from "./routes/adminRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";

// Handle uncaught exceptions
handleUncaughtException();

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Job Portal API is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", notFoundHandler);

// Global error handler
app.use(errorHandler);

// Socket connection handling
handleSocketConnection(io);

// 404 handler
app.use("*", notFoundHandler);

// Global error handler
app.use(errorHandler);

// Socket connection handling
handleSocketConnection(io);

const PORT = process.env.PORT || 5000;

// Start server and run handshake
const startServer = async () => {
  try {
    server.listen(PORT, async () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 API Documentation: http://localhost:${PORT}/api/health`);
      console.log(`⚡ Socket.IO server ready for real-time connections`);

      // Run handshake to ensure admin user exists
      await handshake();

      console.log("✅ Server initialization complete!");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
handleUnhandledRejection(server);
