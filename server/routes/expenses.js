const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { car_id, expense_type, amount, description, expense_date } = req.body;
    
    const carCheck = await pool.query("SELECT * FROM cars WHERE id = $1 AND user_id = $2", [car_id, req.user.id]);
    if (carCheck.rows.length === 0) {
      return res.status(403).json({ error: "Access denied or car not found" });
    }

    const newExpense = await pool.query(
      "INSERT INTO expenses (car_id, expense_type, amount, description, expense_date) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [car_id, expense_type, amount, description, expense_date || new Date()]
    );

    res.status(201).json(newExpense.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:carId", authMiddleware, async (req, res) => {
  try {
    const { carId } = req.params;
    
    const carCheck = await pool.query("SELECT * FROM cars WHERE id = $1 AND user_id = $2", [carId, req.user.id]);
    if (carCheck.rows.length === 0) {
      return res.status(403).json({ error: "Access denied or car not found" });
    }

    const expenses = await pool.query(
      "SELECT * FROM expenses WHERE car_id = $1 ORDER BY expense_date DESC, created_at DESC",
      [carId]
    );

    res.json(expenses.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteOp = await pool.query(
      "DELETE FROM expenses WHERE id = $1 AND car_id IN (SELECT id FROM cars WHERE user_id = $2) RETURNING *",
      [id, req.user.id]
    );

    if (deleteOp.rows.length === 0) {
      return res.status(404).json({ error: "Expense not found or unauthorized" });
    }

    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});