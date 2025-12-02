import { config } from "./config/app";
import app from "./app";
import { getSequelize } from "./config/database";
import "./models"; // Ensure all models load BEFORE DB init
import { initializeFirebase } from "./utils/firebase";

const PORT = config.app.port;

const startServer = async () => {
  try {
    // Initialize Firebase
    try {
      initializeFirebase();
      console.log("✅ Firebase initialized");
    } catch {
      console.warn("⚠️ Firebase not configured (skipped)");
    }

    // Connect Database
    const sequelize = getSequelize();
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    if (config.app.env === "development") {
      await sequelize.sync();
      console.log("🔄 Models synchronized");
    }

    // Start Server
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║ 🚀 ${config.app.name} Server Started            ║
║ 🌐 URL: ${config.app.url}             ║
║ 📡 Port: ${PORT.toString().padEnd(22)}║
║ 🏷️ Environment: ${config.app.env.padEnd(14)}║
╚════════════════════════════════════════╝
      `);
    });

  } catch (error: any) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

// Graceful Error Handlers
process.on("unhandledRejection", (err: any) => {
  console.error("⚠️ Unhandled Rejection:", err);
});

process.on("uncaughtException", (err: any) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

startServer();
