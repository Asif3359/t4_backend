/**
 * Run config/tables.sql against the database.
 *
 * From your machine: use DATABASE_URL_EXTERNAL (or DATABASE_URL = Render External URL).
 *   Render Internal hostnames (e.g. dpg-xxx-a) only work inside Render — use External URL locally.
 * On Render deploy: use DATABASE_URL (Internal URL). Start Command: npm run deploy
 */
require("dotenv").config();
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Prefer External URL when running from local machine (connects to Render Postgres).
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Set DATABASE_URL in .env");
  process.exit(1);
}
const pool = new Pool({ connectionString });

const sqlPath = path.join(__dirname, "..", "config", "tables.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

// Split into statements (by semicolon), strip comments and empty lines.
const statements = sql
  .split(";")
  .map((s) => s.replace(/--[^\n]*/g, "").trim())
  .filter((s) => s.length > 0);

async function run() {
  for (const statement of statements) {
    try {
      await pool.query(statement + ";");
      console.log("OK:", statement.slice(0, 50) + "...");
    } catch (err) {
      // Already exists is fine when re-running.
      if (err.code === "42P07" || err.code === "42701") {
        console.log("Skip (already exists):", statement.slice(0, 50) + "...");
      } else {
        console.error(err.message);
        process.exit(1);
      }
    }
  }
  console.log("Tables ready.");
  await pool.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
