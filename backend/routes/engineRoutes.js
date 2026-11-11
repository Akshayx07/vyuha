import express from "express";
import { calculate } from "../controllers/engineController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/calculate", authMiddleware, calculate);

export default router;
