import request from "supertest";
import app from "../app.ts";
import { connect, close, clearDatabase } from "./setup.ts";

beforeAll(async () => {
  await connect();
});
afterAll(async () => {
  await close();
});
afterEach(async () => {
  await clearDatabase();
});

it("signs up and logs in", async () => {
  const signup = await request(app).post("/auth/signup").send({
    name: "John",
    email: "john@example.com",
    password: "SecurePass123",
  });
  expect(signup.status).toBe(201);
  const login = await request(app)
    .post("/auth/login")
    .send({ email: "john@example.com", password: "SecurePass123" });
  expect(login.status).toBe(200);
  expect(login.body.success).toBe(true);
  expect(login.body.token).toBeDefined();
});
