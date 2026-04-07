const pool = require("../db");

async function searchUsers(req, res) {
  const q = req.query.q || "";
  const result = await pool.query(
    "SELECT public_user_id, created_at FROM users WHERE public_user_id ILIKE $1 ORDER BY public_user_id ASC LIMIT 20",
    [`%${q}%`]
  );
  res.json(result.rows);
}

async function getPublicProfile(req, res) {
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
      const expensesResult = await pool.query(
        "SELECT * FROM expenses WHERE car_id = $1 ORDER BY expense_date DESC, created_at DESC",
        [car.id]
      );
      return { ...car, expenses: expensesResult.rows };
    })
  );

  return res.json({
    user: { publicUserId: user.public_user_id, joinedAt: user.created_at },
    cars: carsWithExpenses
  });
}

module.exports = { searchUsers, getPublicProfile };
