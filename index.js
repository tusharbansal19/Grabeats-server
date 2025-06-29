const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes").router;
const authenticate =require("./routes/authRoutes").authenticate;
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/MailRoutes");
const postRoutes = require("./routes/postRoutes");
const dailytaskRoutes=require("./routes/DailytaskRoutes");
const cron = require('node-cron');
const cors = require("cors");
const mongoose = require("mongoose");
const Drouter=require("./routes/Mydiary")
const grabeatsRoutes = require("./routes/grabeats");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const { PORT_NO, MONGO_URI } = process.env;
require("./pingUrls");
// require('./seedDishes');
// ==================== SECURITY MIDDLEWARE ====================

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ==================== BASIC MIDDLEWARE ====================

app.use(express.json({ limit: '10mb' })); // Built-in middleware for parsing JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://grabeats.onrender.com', "*"],
  credentials: true
}));

app.use(cookieParser()); // Cookie parsing middleware

// ==================== ROUTES ====================

app.use("/user", userRoutes);
app.use("/api", postRoutes);
app.use("/auth", authRoutes);
app.use("/tasks", authenticate, taskRoutes);
app.use("/diary",Drouter)
app.use('/dailytasks', dailytaskRoutes);
app.use("/grabeats", grabeatsRoutes.router);

// Test routes
app.get("/", (req, res) => {
  res.json({ message: "Hello" });
});

app.post("/info", (req, res) => {
  console.log("New Express request", req.body);
  res.json({ error: "This server is deployed by Tushar Bansal" });
});

// ==================== DATABASE CONNECTION ====================

// MongoDB connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// ==================== ERROR HANDLING ====================

// Error handling middleware (optional, for unhandled routes)
app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : {},
  });
});


// ==================== START SERVER ====================

// Start the server
app.listen(PORT_NO, () => {
  console.log(`Express running at port ${PORT_NO}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`MongoDB URI: ${process.env.MONGO_URI}`);
  console.log('Available endpoints:');
  console.log('  POST /grabeats/register - Register new user');
  console.log('  POST /grabeats/login - Login user');
  console.log('  POST /grabeats/logout - Logout user');
  console.log('  GET /grabeats/profile - Get user profile');
  console.log('  PUT /grabeats/profile - Update user profile');
  console.log('  PUT /grabeats/change-password - Change password');
  console.log('  GET /grabeats/health - Health check');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});
