import express from "express";
import {
  createHazard,
  deleteHazard,
  getAllHazards,
  getHazardById,
  updateHazard,
} from "../controllers/hazardController.js";

const router = express.Router();

router
  .post("/", createHazard)
  .get("/", getAllHazards)
  .get("/:id", getHazardById)
  .put("/:id", updateHazard)
  .delete("/:id", deleteHazard);

export default router;
