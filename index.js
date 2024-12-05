const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const userRoutes = require("./routes/MailRoutes");
const postRoutes = require("./routes/postRoutes");

const app = express();
const { PORT_NO, MONGO_URI } = process.env;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Routes
app.use("/user", userRoutes);
app.use("/api", postRoutes);

// Main Routes
app.get("/", (req, res) => {
  res.json({ message: "Hello" });
});

app.get("/info", (req, res) => {
  console.log("New Express request");
  res.json({ message: "This server is deployed by Tushar Bansal" });
});

// Start the server
app.listen(PORT_NO, () => console.log(`Express running at port ${PORT_NO}`));
