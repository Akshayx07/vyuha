import express from "express";
import { PORT, MONGO_URI } from "./config.js";
import connectMongoDB from "./connection.js";
import hazardRoutes from "./routes/hazardRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(express.json());

app.use("/hazards", hazardRoutes);
app.use("/auth", authRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  if (err.name === "CastError" || err.name === "ValidationError") {
    statusCode = 400;
  }

  let message =
    statusCode === 500
      ? "Internal server error"
      : err.message || "Something went wrong";

  res.status(statusCode).json({
    message,
  });
});

async function startServer() {
  try {
    await connectMongoDB(MONGO_URI);

    console.log("MongoDB connected!");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
}

startServer();
