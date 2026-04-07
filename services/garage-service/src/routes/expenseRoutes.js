const express = require("express");
const { requireAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  getCarExpenses,
  createExpense,
  updateExpense,
  deleteExpense
} = require("../controllers/expenseController");

const router = express.Router();

router.use(requireAuth);
router.get("/cars/:carId", getCarExpenses);
router.post("/cars/:carId", upload.single("image"), createExpense);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

module.exports = router;
