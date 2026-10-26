import Hazard from "../models/Hazard.js";

export const createHazard = async (req, res, next) => {
  try {
    const hazard = await Hazard.create({
      createdBy: req.user.userId,
      hazardType: req.body.hazardType,
      severity: req.body.severity,
      location: req.body.location,
    });

    return res.status(201).json(hazard);
  } catch (error) {
    return next(error);
  }
};

export const getAllHazards = async (req, res, next) => {
  try {
    const allHazards = await Hazard.find();
    return res.status(200).json(allHazards);
  } catch (error) {
    return next(error);
  }
};

export const getHazardById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const hazard = await Hazard.findById(id);
    if (!hazard) {
      const error = new Error("Hazard not found");
      error.statusCode = 404;
      return next(error);
    }
    return res.status(200).json(hazard);
  } catch (error) {
    next(error);
  }
};

export const updateHazard = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { hazardType, severity, status, location } = req.body;

    const updates = {};
    if (hazardType !== undefined) updates.hazardType = hazardType;
    if (severity !== undefined) updates.severity = severity;
    if (status !== undefined) updates.status = status;
    if (location !== undefined) updates.location = location;

    const hazard = await Hazard.findOneAndUpdate(
      {
        _id: id,
        createdBy: req.user.userId,
      },
      updates,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!hazard) {
      const error = new Error("Hazard does not exist");
      error.statusCode = 404;
      return next(error);
    }
    return res.status(200).json(hazard);
  } catch (error) {
    next(error);
  }
};

export const deleteHazard = async (req, res, next) => {
  try {
    const id = req.params.id;
    const hazard = await Hazard.findOneAndDelete({
      _id: id,
      createdBy: req.user.userId,
    });
    if (!hazard) {
      const error = new Error("Hazard does not exist");
      error.statusCode = 404;
      return next(error);
    }
    return res.status(200).json({
      message: "Hazard deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
