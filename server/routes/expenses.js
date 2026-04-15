const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");

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
    const { car_id, expense_type, amount, description, expense_date, is_public } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const carCheck = await pool.query("SELECT * FROM cars WHERE id = $1 AND user_id = $2", [car_id, req.user.id]);
    if (carCheck.rows.length === 0) {
      return res.status(403).json({ error: "Access denied or car not found" });
    }

    const newExpense = await pool.query(
      "INSERT INTO expenses (car_id, expense_type, amount, description, image_url, expense_date, is_public) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [car_id, expense_type, amount, description, imageUrl, expense_date || new Date(), is_public === "true" || is_public === true]
    );

    res.status(201).json(newExpense.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:carId", async (req, res) => {
  try {
    const { carId } = req.params;
    const authHeader = req.headers.authorization;
    let userId = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.user ? decoded.user.id : decoded.id;
      } catch (e) {}
    }

    const carOwnerQuery = await pool.query("SELECT user_id FROM cars WHERE id = $1", [carId]);
    if (carOwnerQuery.rows.length === 0) return res.status(404).json({ error: "Car not found" });

    const isOwner = userId === carOwnerQuery.rows[0].user_id;

    let query = "SELECT * FROM expenses WHERE car_id = $1";
    if (!isOwner) {
      query += " AND (is_public = TRUE OR is_public IS NULL)";
    }
    query += " ORDER BY expense_date DESC, created_at DESC";

    const expenses = await pool.query(query, [carId]);
    res.json({ expenses: expenses.rows, isOwner });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", authMiddleware, upload.single("receipt"), async (req, res) => {
  try {
    const { id } = req.params;
    const { expense_type, amount, description, expense_date, is_public } = req.body;

    const expenseCheck = await pool.query(
      "SELECT e.* FROM expenses e JOIN cars c ON e.car_id = c.id WHERE e.id = $1 AND c.user_id = $2",
      [id, req.user.id]
    );

    if (expenseCheck.rows.length === 0) {
      return res.status(404).json({ error: "Expense not found or unauthorized" });
    }

    let imageUrl = expenseCheck.rows[0].image_url;

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      if (expenseCheck.rows[0].image_url) {
        const oldPath = path.join(__dirname, "..", expenseCheck.rows[0].image_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const updatedExpense = await pool.query(
      "UPDATE expenses SET expense_type = $1, amount = $2, description = $3, expense_date = $4, is_public = $5, image_url = $6 WHERE id = $7 RETURNING *",
      [expense_type, amount, description, expense_date, is_public === "true" || is_public === true, imageUrl, id]
    );

    res.json(updatedExpense.rows[0]);
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