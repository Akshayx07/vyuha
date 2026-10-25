import mongoose from "mongoose";

const hazardSchema = new mongoose.Schema(
  {
    typeofHazard: {
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
