require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ service: "user-service", status: "ok" }));
app.use("/api/users", userRoutes);

const port = process.env.PORT || 4003;
app.listen(port, () => {
  console.log(`User service running on port ${port}`);
});
