const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");
const authRoutes = require("./routes/auth");
const carRoutes = require("./routes/cars");
const expenseRoutes = require("./routes/expenses"); 
const profileRoutes = require("./routes/profile");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/expenses", expenseRoutes); 
app.use("/api/profile", profileRoutes);

app.get("/api/health", async (req, res) => {
  try {
    const dbRes = await pool.query("SELECT NOW()");
    res.status(200).json({ status: "OK", time: dbRes.rows[0].now });
  } catch (error) {
    res.status(500).json({ error: "DB Error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});