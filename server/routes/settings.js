const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) {
    cb(null, "avatar-" + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await pool.query("SELECT public_user_id, avatar_url FROM users WHERE id = $1", [req.user.id]);
    res.json(user.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/profile", authMiddleware, upload.single("avatar"), async (req, res) => {
  try {
    const { public_user_id } = req.body;
    
    const idCheck = await pool.query("SELECT id FROM users WHERE public_user_id = $1 AND id != $2", [public_user_id, req.user.id]);
    if (idCheck.rows.length > 0) {
      return res.status(400).json({ error: "This Public ID is already taken" });
    }

    const currentUser = await pool.query("SELECT avatar_url FROM users WHERE id = $1", [req.user.id]);
    let avatarUrl = currentUser.rows[0].avatar_url;

    if (req.file) {
      avatarUrl = `/uploads/${req.file.filename}`;
      if (currentUser.rows[0].avatar_url) {
        const oldPath = path.join(__dirname, "..", currentUser.rows[0].avatar_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const updated = await pool.query(
      "UPDATE users SET public_user_id = $1, avatar_url = $2 WHERE id = $3 RETURNING public_user_id, avatar_url",
      [public_user_id, avatarUrl, req.user.id]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Please enter both passwords." });
    }

    const user = await pool.query("SELECT password_hash FROM users WHERE id = $1", [req.user.id]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found in database." });
    }

    const dbPassword = user.rows[0].password_hash;
    
    let validPassword = false;
    try {
      validPassword = await bcrypt.compare(currentPassword, dbPassword);
    } catch (compareErr) {
      if (currentPassword === dbPassword) {
        validPassword = true;
      } else {
        throw new Error("Password comparison failed: " + compareErr.message);
      }
    }
    
    if (!validPassword) {
      return res.status(400).json({ error: "Incorrect current password" });
    }

    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(newPassword, salt);

    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [bcryptPassword, req.user.id]);
    res.json({ message: "Password updated successfully" });
    
  } catch (err) {
    console.error("ОШИБКА ПАРОЛЯ:", err);
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

module.exports = router;