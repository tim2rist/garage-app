const pool = require("../db");
const { uploadBufferToS3 } = require("../s3");

async function getCarExpenses(req, res) {
  const { carId } = req.params;
  const ownCar = await pool.query("SELECT id FROM cars WHERE id = $1 AND user_id = $2", [carId, req.user.userId]);
  if (!ownCar.rows[0]) return res.status(404).json({ message: "Car not found" });

  const result = await pool.query("SELECT * FROM expenses WHERE car_id = $1 ORDER BY expense_date DESC, created_at DESC", [carId]);
  res.json(result.rows);
}

async function createExpense(req, res) {
  const { carId } = req.params;
  const { expenseType, amount, description, expenseDate } = req.body;

  const ownCar = await pool.query("SELECT id FROM cars WHERE id = $1 AND user_id = $2", [carId, req.user.userId]);
  if (!ownCar.rows[0]) return res.status(404).json({ message: "Car not found" });

  let imageUrl = null;
  if (req.file) {
    const key = `expenses/${req.user.userId}/${Date.now()}-${req.file.originalname}`;
    imageUrl = await uploadBufferToS3({
      buffer: req.file.buffer,
      key,
      contentType: req.file.mimetype
    });
  }

  const result = await pool.query(
    "INSERT INTO expenses (car_id, expense_type, amount, description, image_url, expense_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [carId, expenseType, amount, description || null, imageUrl, expenseDate || null]
  );
  res.status(201).json(result.rows[0]);
}

async function updateExpense(req, res) {
  const { id } = req.params;
  const { expenseType, amount, description, expenseDate } = req.body;

  const result = await pool.query(
    `UPDATE expenses e
     SET expense_type = $1, amount = $2, description = $3, expense_date = $4
     FROM cars c
     WHERE e.id = $5 AND e.car_id = c.id AND c.user_id = $6
     RETURNING e.*`,
    [expenseType, amount, description || null, expenseDate || null, id, req.user.userId]
  );
  if (!result.rows[0]) return res.status(404).json({ message: "Expense not found" });
  res.json(result.rows[0]);
}

async function deleteExpense(req, res) {
  const { id } = req.params;
  const result = await pool.query(
    `DELETE FROM expenses e
     USING cars c
     WHERE e.id = $1 AND e.car_id = c.id AND c.user_id = $2
     RETURNING e.id`,
    [id, req.user.userId]
  );
  if (!result.rows[0]) return res.status(404).json({ message: "Expense not found" });
  res.status(204).send();
}

module.exports = { getCarExpenses, createExpense, updateExpense, deleteExpense };
