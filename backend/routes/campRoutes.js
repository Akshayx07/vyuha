import express from "express";
import {
  createCamp,
  deleteCamp,
  getAllCamps,
  getCampById,
  updateCamp,
} from "../controllers/campController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .post("/", authMiddleware, createCamp)
  .get("/", authMiddleware, getAllCamps)
  .get("/:id", authMiddleware, getCampById)
  .put("/:id", authMiddleware, updateCamp)
  .delete("/:id", authMiddleware, deleteCamp);

export default router;
