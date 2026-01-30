var express = require("express");
var router = express.Router();
var authMiddleware = require("../middleware/authMiddleware");
var pool = require("../config/db");

router.get("/", authMiddleware, async (req, res) => {
  const result = await pool.query(
    `SELECT id, name, email, status, last_login
     FROM users
     ORDER BY last_login DESC NULLS LAST`,
  );

  res.json({
    success: true,
    users: result.rows,
  });
});

router.post("/block", authMiddleware, async (req, res) => {
  const { ids } = req.body;

  await pool.query("UPDATE users SET status='blocked' WHERE id = ANY($1)", [
    ids,
  ]);

  res.json({ success: true, message: "Users blocked" });
});

router.post("/unblock", authMiddleware, async (req, res) => {
  const { ids } = req.body;

  await pool.query("UPDATE users SET status='active' WHERE id = ANY($1)", [
    ids,
  ]);

  res.json({ success: true, message: "Users unblocked" });
});

router.post("/delete", authMiddleware, async (req, res) => {
  const { ids } = req.body;

  await pool.query("DELETE FROM users WHERE id = ANY($1)", [ids]);

  res.json({ success: true, message: "Users deleted" });
});

router.post("/delete-unverified", authMiddleware, async (req, res) => {
  const { ids } = req.body;
  const targetIds = ids && Array.isArray(ids) && ids.length > 0 ? ids : null;

  if (targetIds) {
    await pool.query(
      "DELETE FROM users WHERE status = 'unverified' AND id = ANY($1)",
      [targetIds],
    );
  } else {
    await pool.query("DELETE FROM users WHERE status = 'unverified'");
  }

  res.json({ success: true, message: "Unverified users deleted" });
});

module.exports = router;
