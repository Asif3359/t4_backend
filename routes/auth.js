var express = require("express");
var router = express.Router();
var pool = require("../config/db");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

/** Return user object without sensitive fields (e.g. password). */
function sanitizeUser(user) {
  if (!user) return null;
  var { password, ...safe } = user;
  return safe;
}

/** Return user object without sensitive fields (e.g. password). */
function sanitizeUserRegister(user) {
  if (!user) return null;
  var { password, last_login, ...safe } = user;
  return safe;
}

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool
      .query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
        [name, email, hashedPassword],
      )
      .catch((error) => {
        console.error(error);
        throw error;
      });

    res.status(201).json({
      message: "Registration successful",
      success: true,
      error: null,
      user: sanitizeUserRegister(result.rows[0]),
    });
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      return res.status(400).json({
        message: "Email already exists",
        success: false,
        error: error.message,
        user: null,
      });
    }
    res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
      user: null,
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);

    if (result.rowCount === 0)
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
        error: "Invalid credentials",
        user: null,
        token: null,
      });

    const user = result.rows[0];

    // IMPORTANT: blocked user cannot login
    if (user.status === "blocked")
      return res.status(403).json({
        message: "User is blocked",
        success: false,
        error: "User is blocked",
        user: null,
        token: null,
      });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
        error: "Invalid credentials",
        user: null,
        token: null,
      });

    await pool.query("UPDATE users SET last_login=NOW() WHERE id=$1", [
      user.id,
    ]);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    res.status(200).json({
      message: "Login successful",
      success: true,
      error: null,
      user: sanitizeUser(result.rows[0]),
      token: token,
    });
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      return res.status(400).json({
        message: "Email already exists",
        success: false,
        error: error.message,
        user: null,
        token: null,
      });
    }
    res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
      user: null,
      token: null,
    });
  }
});

module.exports = router;
