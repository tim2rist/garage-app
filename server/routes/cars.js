const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { brand, model, year, plate_number } = req.body;
    const userId = req.user.id;

    const newCar = await pool.query(
      "INSERT INTO cars (user_id, brand, model, year, plate_number) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [userId, brand, model, year, plate_number]
    );

    res.status(201).json(newCar.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const cars = await pool.query(
      "SELECT * FROM cars WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.json(cars.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;