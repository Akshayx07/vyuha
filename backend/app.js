import express from "express";
import hazardRoutes from "./routes/hazardRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import engineRoutes from "./routes/engineRoutes.js";

const app = express();

app.use(express.json());

app.use("/hazards", hazardRoutes);
app.use("/auth", authRoutes);
app.use("/engine", engineRoutes);

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

export default app;
