import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/utils/DB.js";

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(
        `✅  Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
      );
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      console.error("❌  Unhandled Rejection:", err.message);
      server.close(() => process.exit(1));
    });
  })
  .catch((err) => {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1);
  });
