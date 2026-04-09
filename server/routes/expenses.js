const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post("/", authMiddleware, upload.single("receipt"), async (req, res) => {
  try {
    const { car_id, expense_type, amount, description, expense_date } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const carCheck = await pool.query("SELECT * FROM cars WHERE id = $1 AND user_id = $2", [car_id, req.user.id]);
    if (carCheck.rows.length === 0) {
      return res.status(403).json({ error: "Access denied or car not found" });
    }

    const newExpense = await pool.query(
      "INSERT INTO expenses (car_id, expense_type, amount, description, image_url, expense_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [car_id, expense_type, amount, description, imageUrl, expense_date || new Date()]
    );

    res.status(201).json(newExpense.rows[0]);
  } catch (err) {
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
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const expenseCheck = await pool.query("SELECT * FROM expenses WHERE id = $1", [id]);

    const deleteOp = await pool.query(
      "DELETE FROM expenses WHERE id = $1 AND car_id IN (SELECT id FROM cars WHERE user_id = $2) RETURNING *",
      [id, req.user.id]
    );

    if (deleteOp.rows.length === 0) {
      return res.status(404).json({ error: "Expense not found or unauthorized" });
    }

    if (expenseCheck.rows[0].image_url) {
      const filePath = path.join(__dirname, "..", expenseCheck.rows[0].image_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;