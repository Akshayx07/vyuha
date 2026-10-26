import mongoose from "mongoose";

const hazardSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hazardType: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High"],
    },
    status: {
      type: String,
      default: "Active",
    },
    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
  },
  { timestamps: true },
);

const Hazard = mongoose.model("Hazard", hazardSchema);

export default Hazard;
