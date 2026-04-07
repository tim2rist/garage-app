require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ service: "auth-service", status: "ok" }));
app.use("/api/auth", authRoutes);

const port = process.env.PORT || 4001;
app.listen(port, () => {
  console.log(`Auth service running on port ${port}`);
});
