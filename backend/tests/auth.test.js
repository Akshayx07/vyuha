import request from "supertest";
import app from "../app.js";
import { test, expect, beforeAll, afterAll } from "@jest/globals";
import connectMongoDB from "../connection.js";
import { TEST_MONGO_URI } from "../config.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const user = {
  name: "Test User",
  email: "test@example.com",
  password: "TestPassword123",
};

let expiredToken;
let loginToken;

beforeAll(async () => {
  await connectMongoDB(TEST_MONGO_URI);
  await User.deleteMany({ email: user.email });

  expiredToken = jwt.sign(
    { userId: "507f1f77bcf86cd799439011" },
    process.env.JWT_SECRET,
    { expiresIn: "-1s" },
  );
});

test("User registration should return 201", async () => {
  const response = await request(app).post("/auth/register").send(user);
  expect(response.status).toBe(201);
});

test("User login should return 200", async () => {
  const response = await request(app).post("/auth/login").send(user);
  loginToken = response.body.token;
  expect(typeof loginToken).toBe("string");
  expect(response.status).toBe(200);
});

test("User login without token should return 401", async () => {
  const response = await request(app).get("/hazards");
  expect(response.status).toBe(401);
});

const invalidToken = "3243ughoewairuewgr";

test("User login with invalid token should return 401", async () => {
  const response = await request(app)
    .get("/hazards")
    .set("Authorization", `Bearer ${invalidToken}`);
  expect(response.status).toBe(401);
});

test("User login with expired token should return 401", async () => {
  const response = await request(app)
    .get("/hazards")
    .set("Authorization", `Bearer ${expiredToken}`);
  expect(response.status).toBe(401);
});

afterAll(async () => {
  await User.deleteMany({ email: user.email });
  await mongoose.disconnect();
});
