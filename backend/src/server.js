const app = require("./app");
const env = require("./config/env");
const { query } = require("./config/database");
const { bootstrapDatabase } = require("./database/bootstrap");

async function startServer() {
  await query("SELECT 1");
  await bootstrapDatabase();

  app.listen(env.port, () => {
    console.log(`Payroll backend listening on port ${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
