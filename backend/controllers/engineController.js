import { runEngine } from "../utils/engineRunner.js";
import { randomUUID } from "node:crypto";
import Hazard from "../models/Hazard.js";
import Camp from "../models/Camp.js";

export const calculate = async (req, res, next) => {
  try {
    const { origin, destination } = req.body;
    const [hazards, camps] = await Promise.all([
      Hazard.find({ status: "Active" }),
      Camp.find({ status: "Active" }),
    ]);
    const payload = {
      origin,
      destination,
      hazards: hazards.map((hazard) => ({
        severity: hazard.severity,
        location: hazard.location.coordinates,
      })),
      camps: camps.map((camp) => ({
        location: camp.location.coordinates,
      })),
    };
    const requestId = randomUUID();
    const result = await runEngine({
      requestId,
      action: "calculateDistance",
      payload,
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};
