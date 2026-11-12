import mongoose from "mongoose";

const campSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (coordinates) => {
            if (!Array.isArray(coordinates) || coordinates.length !== 2) {
              return false;
            }

            const [longitude, latitude] = coordinates;

            return (
              Number.isFinite(longitude) &&
              Number.isFinite(latitude) &&
              longitude >= -180 &&
              longitude <= 180 &&
              latitude >= -90 &&
              latitude <= 90
            );
          },
          message: "Coordinates must contain two valid numbers",
        },
      },
    },
  },
  { timestamps: true },
);

campSchema.index({ location: "2dsphere" });

const Camp = mongoose.model("Camp", campSchema);

export default Camp;
