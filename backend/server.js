import express from "express";
import connectMongoDB from "./connection.js";
import hazardRoutes from "./routes/hazardRoutes.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/hazards", hazardRoutes);

async function startServer() {
  try {
    await connectMongoDB("mongodb://127.0.0.1:27017/vyuha");

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
