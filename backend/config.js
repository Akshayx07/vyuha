import dotenv from "dotenv";

dotenv.config();

export const PORT = Number(process.env.PORT);
export const MONGO_URI = process.env.MONGO_URI;

if (!process.env.PORT) {
  throw new Error("PORT is missing from .env");
}
if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is missing from .env");
}
if (Number.isNaN(PORT) || !Number.isInteger(PORT)) {
  throw new Error("PORT must be a valid number");
}
if (PORT <= 0 || PORT > 65535) {
  throw new Error("PORT must be between 1 and 65535");
}
