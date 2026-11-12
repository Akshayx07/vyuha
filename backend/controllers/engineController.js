import { runEngine } from "../utils/engineRunner.js";
import { randomUUID } from "node:crypto";

export const calculate = async (req, res, next) => {
  try {
    const { origin, destination } = req.body;
    const payload = { origin, destination };
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
