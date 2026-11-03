import request from "supertest";
import app from "../app.js";
import { test, expect, beforeAll, afterAll } from "@jest/globals";
import connectMongoDB from "../connection.js";
import { TEST_MONGO_URI } from "../config.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Hazard from "../models/Hazard.js";

const userA = {
  name: "Test User A",
  email: "test-userA@example.com",
  password: "TestPassword123",
};

const userB = {
  name: "Test User B",
  email: "test-userB@example.com",
  password: "TestPassword123",
};

const hazard = {
  hazardType: "Flood",
  severity: "High",
  location: {
    type: "Point",
    coordinates: [83.0, 25.0],
  },
};

const severities = ["Low", "Medium", "High"];
const statuses = ["Active", "Inactive"];

const invalidPaginationQueries = [
  "page=0",
  "page=-1",
  "limit=0",
  "limit=101",
  "page=abc",
];

let tokenA;
let tokenB;
let hazardIdA;
let hazardIdB;

const updatedHazardA = {
  severity: "Medium",
};

beforeAll(async () => {
  await connectMongoDB(TEST_MONGO_URI);

  await Hazard.deleteMany({
    createdBy: {
      $in: await User.find({
        email: { $in: [userA.email, userB.email] },
      }).distinct("_id"),
    },
  });

  await User.deleteMany({ email: { $in: [userA.email, userB.email] } });
});

afterAll(async () => {
  const users = await User.find({
    email: { $in: [userA.email, userB.email] },
  }).select("_id");

  await Hazard.deleteMany({
    createdBy: { $in: users.map((user) => user._id) },
  });

  await User.deleteMany({
    email: { $in: [userA.email, userB.email] },
  });

  await mongoose.disconnect();
});

test("User A registration should return 201", async () => {
  const response = await request(app).post("/auth/register").send(userA);
  expect(response.status).toBe(201);
});

test("User B registration should return 201", async () => {
  const response = await request(app).post("/auth/register").send(userB);
  expect(response.status).toBe(201);
});

test("User A login should return 200", async () => {
  const response = await request(app).post("/auth/login").send(userA);
  tokenA = response.body.token;
  expect(typeof tokenA).toBe("string");
  expect(response.status).toBe(200);
});

test("User B login should return 200", async () => {
  const response = await request(app).post("/auth/login").send(userB);
  tokenB = response.body.token;
  expect(typeof tokenB).toBe("string");
  expect(response.status).toBe(200);
});

test("User A created hazard should return 201", async () => {
  const response = await request(app)
    .post("/hazards")
    .set("Authorization", `Bearer ${tokenA}`)
    .send(hazard);
  expect(response.status).toBe(201);
  expect(response.body._id).toBeDefined();
  expect(response.body.createdBy).toBeDefined();
  hazardIdA = response.body._id;
});

test("User B created hazard should return 201", async () => {
  const response = await request(app)
    .post("/hazards")
    .set("Authorization", `Bearer ${tokenB}`)
    .send(hazard);
  expect(response.status).toBe(201);
  expect(response.body._id).toBeDefined();
  expect(response.body.createdBy).toBeDefined();
  hazardIdB = response.body._id;
});

test("User A updated hazard should return 200", async () => {
  const response = await request(app)
    .put(`/hazards/${hazardIdA}`)
    .set("Authorization", `Bearer ${tokenA}`)
    .send(updatedHazardA);
  expect(response.body.severity).toBe("Medium");
  expect(response.status).toBe(200);
});

test("User B updating User A hazard should return 404", async () => {
  const response = await request(app)
    .put(`/hazards/${hazardIdA}`)
    .set("Authorization", `Bearer ${tokenB}`)
    .send(updatedHazardA);
  expect(response.status).toBe(404);
});

test("User A deleting User B hazard should return 404", async () => {
  const response = await request(app)
    .delete(`/hazards/${hazardIdB}`)
    .set("Authorization", `Bearer ${tokenA}`);
  expect(response.status).toBe(404);
});

test("User B deleting hazard should return 200", async () => {
  const response = await request(app)
    .delete(`/hazards/${hazardIdB}`)
    .set("Authorization", `Bearer ${tokenB}`);
  expect(response.status).toBe(200);
});

test("Authenticated user should get all hazards", async () => {
  const response = await request(app)
    .get("/hazards")
    .set("Authorization", `Bearer ${tokenA}`);
  expect(Array.isArray(response.body.data)).toBe(true);
  expect(response.body.pagination).toBeDefined();
  expect(response.status).toBe(200);
});

test.each(severities)(
  "Getting hazards with severity %s should return only matching hazards",
  async (severity) => {
    const response = await request(app)
      .get(`/hazards?severity=${severity}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(response.status).toBe(200);
    expect(
      response.body.data.every((hazard) => hazard.severity === severity),
    ).toBe(true);
  },
);

test.each(statuses)(
  "Getting hazards with status %s should return only matching hazards",
  async (status) => {
    const response = await request(app)
      .get(`/hazards?status=${status}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(response.status).toBe(200);
    expect(response.body.data.every((hazard) => hazard.status === status)).toBe(
      true,
    );
  },
);

const filterCombinations = severities.flatMap((severity) =>
  statuses.map((status) => [severity, status]),
);

test.each(filterCombinations)(
  "Filtering hazards by severity %s and status %s",
  async (severity, status) => {
    const response = await request(app)
      .get(`/hazards?severity=${severity}&status=${status}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(
      response.body.data.every(
        (hazard) => hazard.severity === severity && hazard.status === status,
      ),
    ).toBe(true);
  },
);

test("Invalid severity should return 400", async () => {
  const response = await request(app)
    .get("/hazards?severity=Extreme")
    .set("Authorization", `Bearer ${tokenA}`);
  expect(response.status).toBe(400);
});

test("Invalid status should return 400", async () => {
  const response = await request(app)
    .get("/hazards?status=Pending")
    .set("Authorization", `Bearer ${tokenA}`);
  expect(response.status).toBe(400);
});

test("Valid pagination should return 200", async () => {
  const response = await request(app)
    .get("/hazards?page=1&limit=2")
    .set("Authorization", `Bearer ${tokenA}`);
  expect(Array.isArray(response.body.data)).toBe(true);
  expect(response.body.pagination.page).toBe(1);
  expect(response.body.pagination.limit).toBe(2);
  expect(response.body.data.length).toBeLessThanOrEqual(2);
  expect(response.status).toBe(200);
});

test.each(invalidPaginationQueries)(
  "Invalid pagination query %s should return 400",
  async (query) => {
    const response = await request(app)
      .get(`/hazards?${query}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(response.status).toBe(400);
  },
);
