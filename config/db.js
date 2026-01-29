const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Test database connection. Returns a promise that resolves if connected, rejects on error.
 */
async function testConnection() {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    return true;
  } finally {
    client.release();
  }
}

module.exports = pool;
module.exports.testConnection = testConnection;
