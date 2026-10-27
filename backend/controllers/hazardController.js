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
    const severity = req.query.severity;
    const status = req.query.status;
    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);
    if (
      !Number.isInteger(page) ||
      page <= 0 ||
      !Number.isInteger(limit) ||
      limit <= 0 ||
      limit > 100
    ) {
      const error = new Error("Invalid request");
      error.statusCode = 400;
      return next(error);
    }
    const skip = (page - 1) * limit;

    let filter = {};
    if (severity !== undefined) filter.severity = severity;
    if (status !== undefined) filter.status = status;

    const total = await Hazard.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const pagination = { page, limit, total, totalPages };

    const allHazards = await Hazard.find(filter).skip(skip).limit(limit);

    return res.status(200).json({
      data: allHazards,
      pagination,
    });
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

export const getNearbyHazards = async (req, res, next) => {
  try {
    const long = Number(req.query.longitude);
    const lat = Number(req.query.latitude);
    if (
      !Number.isFinite(long) ||
      !Number.isFinite(lat) ||
      long < -180 ||
      long > 180 ||
      lat < -90 ||
      lat > 90
    ) {
      const error = new Error("Invalid longitude or latitude");
      error.statusCode = 400;
      return next(error);
    }
    const maxDistance = Number(req.query.maxDistance);
    if (
      !Number.isFinite(maxDistance) ||
      maxDistance <= 0 ||
      maxDistance > 50000
    ) {
      const error = new Error(
        "Maximum distance must be greater than 0 and at most 50000 metres",
      );
      error.statusCode = 400;
      return next(error);
    }

    const filter = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [long, lat],
          },
          $maxDistance: maxDistance,
        },
      },
    };

    const severity = req.query.severity;
    const status = req.query.status;

    if (severity !== undefined) {
      if (!["Low", "Medium", "High"].includes(severity)) {
        const error = new Error("Invalid severity");
        error.statusCode = 400;
        return next(error);
      }
      filter.severity = severity;
    }
    if (status !== undefined) {
      if (!["Active", "Inactive"].includes(status)) {
        const error = new Error("Invalid status");
        error.statusCode = 400;
        return next(error);
      }
      filter.status = status;
    }

    const hazards = await Hazard.find(filter);

    return res.status(200).json(hazards);
  } catch (error) {
    return next(error);
  }
};
