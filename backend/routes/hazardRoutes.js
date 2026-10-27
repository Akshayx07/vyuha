import express from "express";
import {
  createHazard,
  deleteHazard,
  getAllHazards,
  getHazardById,
  getNearbyHazards,
  updateHazard,
} from "../controllers/hazardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .post("/", authMiddleware, createHazard)
  .get("/", authMiddleware, getAllHazards)
  .get("/nearby", authMiddleware, getNearbyHazards)
  .get("/:id", authMiddleware, getHazardById)
  .put("/:id", authMiddleware, updateHazard)
  .delete("/:id", authMiddleware, deleteHazard);

export default router;
