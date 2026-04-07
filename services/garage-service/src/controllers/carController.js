const pool = require("../db");

async function getCars(req, res) {
  const result = await pool.query("SELECT * FROM cars WHERE user_id = $1 ORDER BY created_at DESC", [req.user.userId]);
  res.json(result.rows);
}

async function createCar(req, res) {
  const { brand, model, year, plateNumber } = req.body;
  const result = await pool.query(
    "INSERT INTO cars (user_id, brand, model, year, plate_number) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [req.user.userId, brand, model, year || null, plateNumber || null]
  );
  res.status(201).json(result.rows[0]);
}

async function updateCar(req, res) {
  const { id } = req.params;
  const { brand, model, year, plateNumber } = req.body;
  const result = await pool.query(
    "UPDATE cars SET brand = $1, model = $2, year = $3, plate_number = $4 WHERE id = $5 AND user_id = $6 RETURNING *",
    [brand, model, year || null, plateNumber || null, id, req.user.userId]
  );
  if (!result.rows[0]) return res.status(404).json({ message: "Car not found" });
  res.json(result.rows[0]);
}

async function deleteCar(req, res) {
  const { id } = req.params;
  const result = await pool.query("DELETE FROM cars WHERE id = $1 AND user_id = $2 RETURNING id", [id, req.user.userId]);
  if (!result.rows[0]) return res.status(404).json({ message: "Car not found" });
  res.status(204).send();
}

module.exports = { getCars, createCar, updateCar, deleteCar };
