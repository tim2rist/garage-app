const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const publicUserId = username || email.split("@")[0];

    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR public_user_id = $2",
      [email, publicUserId]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (email, password_hash, public_user_id) VALUES ($1, $2, $3) RETURNING id, email, public_user_id",
      [email, passwordHash, publicUserId]
    );

    const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({ token, publicUserId: newUser.rows[0].public_user_id });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ token, publicUserId: user.rows[0].public_user_id });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;