const express = require("express");
const jwt = require("jsonwebtoken");
const Auth = require("../models/Auth");
const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, image } = req.body;
    console.log(req.body, "req.body");
    const user = new Auth({ name, email, password, image });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).json({ message: "User registered successfully", token, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login a user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email,password, "email,password");
    const user = await Auth.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    console.log(email,password, "email,password");
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Alias for signup (same as register)
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, image } = req.body;
    const user = new Auth({ name, email, password, image });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.json({ token, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Middleware to protect routes
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = {router,authenticate} ;
