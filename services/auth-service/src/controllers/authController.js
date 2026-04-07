const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

async function register(req, res) {
  const { email, password, publicUserId } = req.body;
  if (!email || !password || !publicUserId) {
    return res.status(400).json({ message: "email, password, publicUserId are required" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password_hash, public_user_id) VALUES ($1, $2, $3) RETURNING id, email, public_user_id",
      [email, passwordHash, publicUserId]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, email: user.email, publicUserId: user.public_user_id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({ token, user });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "email or publicUserId already exists" });
    }
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, publicUserId: user.public_user_id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: { id: user.id, email: user.email, public_user_id: user.public_user_id }
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
}

function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = { register, login, me };
