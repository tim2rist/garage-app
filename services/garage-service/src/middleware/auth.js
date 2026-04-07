const axios = require("axios");

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/api/auth/me`, {
      headers: { Authorization: authHeader }
    });
    req.user = response.data.user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = { requireAuth };
