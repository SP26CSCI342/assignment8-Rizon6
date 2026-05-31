// server/server.js
// Assignment 6 â€” Express backend for PlateScout.
// This server stores users in memory for now.
// MongoDB, password hashing, JWTs, and protected routes come later.

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware â€” mounted BEFORE any route.
//   cors()           â€” lets the browser call this server during dev
//   express.json()   â€” populates req.body on POST requests
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://your-platescout.vercel.app", // CHANGE AFTER STEP D
    /\.vercel\.app$/,
  ],
  credentials: true,
}));
app.use(express.json());

// mongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected!"))
  .catch(err => console.error("MongoDB error:", err));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true},
  password: { type: String, required: true, minlength: 8 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

function validateInputs({ username, email, password }) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!username || username.trim().length < 3){
    return "Username must be at least 3 characters.";
  }
  if (!email || !emailRegex.test(email)){
    return "Email is invalid.";
  }
  if (!password || password.length < 8){
    return "Password must be at least 8 characters.";
  }

  return "";
}

app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  const validationError = validateInputs({ username, email, password });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // check for existing username
  const duplicateUser = await User.findOne({ username })
  if (duplicateUser){
    return res.status(409).json({ error: "Username already taken." });
  }

  // encrypt password
  const hash = await bcrypt.hash(password, 10);

  // add new user to DB
  const newUser = await User.create ({
    username,
    email,
    password: hash,
  });

  // sign json web token
  const token = jwt.sign(
    { id: newUser._id }, 
    process.env.JWT_SECRET,
    { expiresIn: "1h" });

  return res.status(201).json({
    message: "User registered successfully.",
    user: {
      username: newUser.username,
      email: newUser.email,
    },
    token
  });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: "Username and password are required.",
    });
  }

  const user = await User.findOne({ username });
  if (!user){
    return res.status(401).json({ error: "Invalid username or password." });
  }

  // compare encrypted passwords
  const passMatch = await bcrypt.compare(password, user.password);
  if (!passMatch){
    return res.status(401).json({ error: "Invalid username or password." });
  }

  // sign json web token
  const token = jwt.sign(
    { id: user._id }, 
    process.env.JWT_SECRET,
    { expiresIn: "1h" });

  return res.status(200).json({
    message: "Login successful.",
    user: {
      username: user.username,
      email: user.email,
    },
    token,
  });
});

app.post("/api/logout", (req, res) => {
  const auth = req.headers.authorization;

  // check if token exists or is malformed
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token." });
  }

  const token = auth.split(" ")[1];

  try {
    jwt.verify(token, process.env.JWT_SECRET);

    return res.status(200).json({ message: "Logged out." })
  } catch(err) {
    // accept expired token
    if (err.name === "TokenExpiredError") {
      return res.status(200).json({ message: "Logged out." })
    }
    return res.status(401).json({ error: "Invalid token."})
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
    mongo: mongoose.connection.readyState === 1,
  });
});

app.get("/api/users", async (req, res) => {
  const users = await User.find();

  if (users.length === 0) {
    return res.status(200).json({message: "No users found."}); // users array is empty
  }

  return res.status(200).json(users); // return list of users
});

app.post("/api/testUsers", async (req, res) => {
  const testUser1 = {
    username: "Rizon",
    email: "rizon@x.com",
    password: "pass1234",
  };
  const testUser2 = {
    username: "Brooke",
    email: "brooke@x.com",
    password: "secret1234",
  };
  const hash1 = await bcrypt.hash(testUser1.password, 10);
  const hash2 = await bcrypt.hash(testUser2.password, 10);

  const user1Exists = await User.findOne({ username: testUser1.username });
  const user2Exists = await User.findOne({ username: testUser2.username });

  if (user1Exists || user2Exists){
    return res.status(409).json({ 
      error: "Username(s) for test users already taken.",
      users: [
        {
          username: testUser1.username,
        },
        {
          username: testUser2.username,
        },
      ],
    });
  }

  await User.create([
    {
      username: testUser1.username,
      email: testUser1.email,
      password: hash1,
    },
    {
      username: testUser2.username,
      email: testUser2.email,
      password: hash2,
    }
  ]);

  return res.status(201).json({
    message: "2 test users registered succesfully.",
    users: [
      {
        username: testUser1.username,
        email: testUser1.email,
        password: testUser1.password,
      },
      {
        username: testUser2.username,
        email: testUser2.email,
        password: testUser2.password,
      },
    ],
  });
});

// 404 fallback â€” must come AFTER all routes so they match first.
app.use((req, res) => {
  return res.status(404).json({
    error: "Route not found.",
  });
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});