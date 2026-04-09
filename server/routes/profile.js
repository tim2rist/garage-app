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
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;