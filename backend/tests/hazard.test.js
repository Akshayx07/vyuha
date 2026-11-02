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
  hazardIdA = response.body._id;
  expect(hazardIdA).toBeDefined();
  expect(response.body.createdBy).toBeDefined();
  expect(response.status).toBe(201);
});

test("User B created hazard should return 201", async () => {
  const response = await request(app)
    .post("/hazards")
    .set("Authorization", `Bearer ${tokenB}`)
    .send(hazard);
  hazardIdB = response.body._id;
  expect(hazardIdB).toBeDefined();
  expect(response.body.createdBy).toBeDefined();
  expect(response.status).toBe(201);
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
