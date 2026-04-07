const pool = require("../db");

async function getPublicUserGarage(req, res) {
  const { publicUserId } = req.params;

  const userResult = await pool.query(
    "SELECT id, public_user_id, created_at FROM users WHERE public_user_id = $1",
    [publicUserId]
  );
  const user = userResult.rows[0];
  if (!user) return res.status(404).json({ message: "User not found" });

  const carsResult = await pool.query("SELECT * FROM cars WHERE user_id = $1 ORDER BY created_at DESC", [user.id]);
  const cars = carsResult.rows;

  const carsWithExpenses = await Promise.all(
    cars.map(async (car) => {
      const expenses = await pool.query(
        "SELECT * FROM expenses WHERE car_id = $1 ORDER BY expense_date DESC, created_at DESC",
        [car.id]
      );
      return { ...car, expenses: expenses.rows };
    })
  );

  return res.json({ user, cars: carsWithExpenses });
}

module.exports = { getPublicUserGarage };
