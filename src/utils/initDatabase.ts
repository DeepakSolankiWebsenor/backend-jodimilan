import { getSequelize } from "../config/database";
import "../models"; // Ensure models are loaded

let initialized = false;

export async function initDatabase() {
  if (!initialized) {
    const sequelize = getSequelize();
    await sequelize.authenticate();
    await sequelize.sync();
    initialized = true;
    console.log("🔄 Models initialized for serverless");
  }
}
