import express from "express";
import {
  createHazard,
  deleteHazard,
  getAllHazards,
  getHazardById,
  updateHazard,
} from "../controllers/hazardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .post("/", authMiddleware, createHazard)
  .get("/", authMiddleware, getAllHazards)
  .get("/:id", authMiddleware, getHazardById)
  .put("/:id", authMiddleware, updateHazard)
  .delete("/:id", authMiddleware, deleteHazard);

export default router;
