import Hazard from "../models/Hazard.js";

export const createHazard = async (req, res) => {
  try {
    const hazard = await Hazard.create(req.body);

    return res.status(201).json(hazard);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: error.message,
      });
    }
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getAllHazards = async (req, res) => {
  try {
    const allHazards = await Hazard.find();
    return res.status(200).json(allHazards);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getHazardById = async (req, res) => {
  try {
    const id = req.params.id;
    const hazard = await Hazard.findById(id);
    if (!hazard) {
      return res.status(404).json({
        error: "Hazard not found",
      });
    }
    return res.status(200).json(hazard);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        error: "Invalid hazard ID",
      });
    }
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const updateHazard = async (req, res) => {
  try {
    const id = req.params.id;
    const { typeofHazard, severity, status, location } = req.body;

    const updates = {};
    if (typeofHazard !== undefined) updates.typeofHazard = typeofHazard;
    if (severity !== undefined) updates.severity = severity;
    if (status !== undefined) updates.status = status;
    if (location !== undefined) updates.location = location;
    const hazard = await Hazard.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!hazard) {
      return res.status(404).json({
        error: "Hazard does not exist",
      });
    }
    return res.status(200).json(hazard);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: error.message,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        error: "Invalid hazard ID",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const deleteHazard = async (req, res) => {
  try {
    const id = req.params.id;
    const hazard = await Hazard.findByIdAndDelete(id);
    if (!hazard) {
      return res.status(404).json({
        error: "Hazard not found",
      });
    }
    return res.status(200).json({
      message: "Hazard deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        error: "Invalid hazard ID",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
