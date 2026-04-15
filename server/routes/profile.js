const express = require("express");
const pool = require("../db");
const router = express.Router();

router.get("/stats/:publicUserId", async (req, res) => {
  try {
    const { publicUserId } = req.params;

    const stats = await pool.query(
      `SELECT 
        COUNT(DISTINCT c.id) as car_count, 
        COALESCE(SUM(e.amount), 0) as total_expenses
      FROM users u
      LEFT JOIN cars c ON u.id = c.user_id
      LEFT JOIN expenses e ON c.id = e.car_id
      WHERE u.public_user_id = $1`,
      [publicUserId]
    );

    res.json(stats.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    const users = await pool.query(
      "SELECT public_user_id FROM users WHERE public_user_id ILIKE $1 LIMIT 10",
      [`%${query}%`]
    );
    res.json(users.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/cars/:publicUserId", async (req, res) => {
  try {
    const { publicUserId } = req.params;
    const userCars = await pool.query(
      `SELECT c.* FROM cars c 
       JOIN users u ON c.user_id = u.id 
       WHERE u.public_user_id = $1`,
      [publicUserId]
    );
    res.json(userCars.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;