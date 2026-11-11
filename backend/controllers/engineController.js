import { runEngine } from "../utils/engineRunner.js";

export const calculate = async (req, res, next) => {
  try {
    const { number, operation } = req.body;
    const result = await runEngine({ number, operation });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};
