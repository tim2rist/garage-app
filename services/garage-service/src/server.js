require("dotenv").config();
const express = require("express");
const cors = require("cors");
const carRoutes = require("./routes/carRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const publicRoutes = require("./routes/publicRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ service: "garage-service", status: "ok" }));
app.use("/api/cars", carRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/public", publicRoutes);

const port = process.env.PORT || 4002;
app.listen(port, () => {
  console.log(`Garage service running on port ${port}`);
});
