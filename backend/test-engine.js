import { runEngine } from "./utils/engineRunner.js";
import { randomUUID } from "node:crypto";

const result = await runEngine({
  requestId: randomUUID(),
  action: "calculateDistance",
  payload: {
    origin: {
      type: "Point",
      coordinates: [77.209, 28.6139],
    },
    destination: {
      type: "Point",
      coordinates: [72.8777, 19.076],
    },
    hazards: [
      {
        severity: "High",
        location: [75.7873, 26.9124],
      },
      {
        severity: "Medium",
        location: [76.0, 25.5],
        radius: 3,
      },
      {
        severity: "Low",
        location: [73.7125, 24.5854],
      },
    ],
    camps: [
      {
        name: "Camp Jaipur",
        location: [75.7873, 27.2],
      },
      {
        name: "Camp Udaipur",
        location: [73.7125, 24.9],
      },
      {
        name: "Camp Surat",
        location: [72.8311, 21.1702],
      },
    ],
  },
});

console.log(result);
