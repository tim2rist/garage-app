const express = require("express");
const { getPublicUserGarage } = require("../controllers/publicController");

const router = express.Router();

router.get("/users/:publicUserId/garage", getPublicUserGarage);

module.exports = router;
