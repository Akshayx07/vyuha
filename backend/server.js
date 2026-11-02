import { PORT, MONGO_URI } from "./config.js";
import connectMongoDB from "./connection.js";
import app from "./app.js";

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
