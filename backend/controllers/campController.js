import Camp from "../models/Camp.js";

const statuses = ["Active", "Inactive"];

const validateLocation = (location) => {
  if (
    !location ||
    typeof location !== "object" ||
    Array.isArray(location) ||
    location.type !== "Point" ||
    !Array.isArray(location.coordinates) ||
    location.coordinates.length !== 2
  ) {
    return "Invalid location format";
  }

  const [longitude, latitude] = location.coordinates;
  if (
    !Number.isFinite(longitude) ||
    !Number.isFinite(latitude) ||
    longitude < -180 ||
    longitude > 180 ||
    latitude < -90 ||
    latitude > 90
  ) {
    return "Invalid location coordinates";
  }

  return null;
};

const validateCapacity = (capacity) => {
  if (
    typeof capacity !== "number" ||
    !Number.isFinite(capacity) ||
    capacity < 0
  ) {
    return "Invalid capacity";
  }

  return null;
};

export const createCamp = async (req, res, next) => {
  try {
    const allowedFields = ["name", "capacity", "status", "location"];
    if (Object.keys(req.body).some((field) => !allowedFields.includes(field))) {
      const error = new Error("Invalid fields are provided");
      error.statusCode = 400;
      return next(error);
    }

    const { name, capacity, status, location } = req.body;

    const locationError = validateLocation(location);
    if (locationError) {
      const error = new Error(locationError);
      error.statusCode = 400;
      return next(error);
    }

    if (typeof name !== "string" || !name.trim()) {
      const error = new Error("Name is required");
      error.statusCode = 400;
      return next(error);
    }

    if (capacity !== undefined) {
      const capacityError = validateCapacity(capacity);
      if (capacityError) {
        const error = new Error(capacityError);
        error.statusCode = 400;
        return next(error);
      }
    }

    if (status !== undefined && !statuses.includes(status)) {
      const error = new Error("Invalid status");
      error.statusCode = 400;
      return next(error);
    }

    const camp = await Camp.create({
      createdBy: req.user.userId,
      name,
      capacity,
      status,
      location,
    });

    return res.status(201).json(camp);
  } catch (error) {
    return next(error);
  }
};

export const getAllCamps = async (req, res, next) => {
  try {
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
    if (status !== undefined) {
      if (!statuses.includes(status)) {
        const error = new Error("Invalid status");
        error.statusCode = 400;
        return next(error);
      }
      filter.status = status;
    }

    const total = await Camp.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const pagination = { page, limit, total, totalPages };

    const allCamps = await Camp.find(filter).skip(skip).limit(limit);

    return res.status(200).json({
      data: allCamps,
      pagination,
    });
  } catch (error) {
    return next(error);
  }
};

export const getCampById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const camp = await Camp.findById(id);
    if (!camp) {
      const error = new Error("Camp not found");
      error.statusCode = 404;
      return next(error);
    }
    return res.status(200).json(camp);
  } catch (error) {
    return next(error);
  }
};

export const updateCamp = async (req, res, next) => {
  try {
    const id = req.params.id;

    const allowedFields = ["name", "capacity", "status", "location"];
    if (Object.keys(req.body).some((field) => !allowedFields.includes(field))) {
      const error = new Error("Invalid fields are provided");
      error.statusCode = 400;
      return next(error);
    }

    const { name, capacity, status, location } = req.body;
    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        const error = new Error("Name is required");
        error.statusCode = 400;
        return next(error);
      }
      updates.name = name;
    }

    if (capacity !== undefined) {
      const capacityError = validateCapacity(capacity);
      if (capacityError) {
        const error = new Error(capacityError);
        error.statusCode = 400;
        return next(error);
      }
      updates.capacity = capacity;
    }

    if (status !== undefined) {
      if (!statuses.includes(status)) {
        const error = new Error("Invalid status");
        error.statusCode = 400;
        return next(error);
      }
      updates.status = status;
    }

    if (location !== undefined) {
      const locationError = validateLocation(location);
      if (locationError) {
        const error = new Error(locationError);
        error.statusCode = 400;
        return next(error);
      }
      updates.location = location;
    }

    if (Object.keys(updates).length === 0) {
      const error = new Error("No fields provided for update");
      error.statusCode = 400;
      return next(error);
    }

    const camp = await Camp.findOneAndUpdate(
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
    if (!camp) {
      const error = new Error("Camp does not exist");
      error.statusCode = 404;
      return next(error);
    }
    return res.status(200).json(camp);
  } catch (error) {
    return next(error);
  }
};

export const deleteCamp = async (req, res, next) => {
  try {
    const id = req.params.id;
    const camp = await Camp.findOneAndDelete({
      _id: id,
      createdBy: req.user.userId,
    });
    if (!camp) {
      const error = new Error("Camp does not exist");
      error.statusCode = 404;
      return next(error);
    }
    return res.status(200).json({
      message: "Camp deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};
