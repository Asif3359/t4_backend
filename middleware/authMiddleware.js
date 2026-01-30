// IMPORTANT: global auth + block check
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

module.exports = async function (req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query("SELECT * FROM users WHERE id=$1", [
      decoded.id,
    ]);

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    if (result.rows[0].status === "blocked") {
      return res.status(403).json({ message: "User blocked" });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
