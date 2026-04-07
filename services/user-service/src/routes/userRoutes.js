const express = require("express");
const { searchUsers, getPublicProfile } = require("../controllers/userController");

const router = express.Router();

router.get("/search", searchUsers);
router.get("/profile/:publicUserId", getPublicProfile);

module.exports = router;
