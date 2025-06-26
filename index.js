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
const app = express();
const { PORT_NO, MONGO_URI } = process.env;
require("./pingUrls");

app.use(express.json()); // Built-in middleware for parsing JSON bodies
// Middleware
app.use(cors( 
  {
    origin: "*", // Allowed origins
    // Enable setting of cookies
  }
)); // Enable Cross-Origin Resource Sharing

// Routes




app.use("/user", userRoutes);
app.use("/api", postRoutes);
app.use("/auth", authRoutes);
app.use("/tasks", authenticate, taskRoutes);
app.use("/diary",Drouter)
app.use('/dailytasks', dailytaskRoutes);
app.use("/grabeats", grabeatsRoutes);
// Test routes
app.get("/", (req, res) => {
  res.json({ message: "Hello" });
});

app.post("/info", (req, res) => {
  
  console.log("New Express request", req.body);
  res.json({ error: "This server is deployed by Tushar Bansal" });
});

app.use(cookieParser()); // Cookie parsing middleware
// MongoDB connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

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

// Start the server
app.listen(PORT_NO, () => {
  console.log(`Express running at port ${PORT_NO}`);
});
