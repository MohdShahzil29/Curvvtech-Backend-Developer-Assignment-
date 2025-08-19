import request from "supertest";
import app from "../app.ts";
import { connect, close, clearDatabase } from "./setup.ts";

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await close()); // Cleanup

// 🔐 Helper function to get JWT token
async function auth() {
  await request(app).post("/auth/signup").send({
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  });

  const login = await request(app)
    .post("/auth/login")
    .send({ email: "test@example.com", password: "password123" });

  return login.body.token;
}

it("creates and lists devices", async () => {
  const token = await auth();

  // Create device
  const create = await request(app)
    .post("/devices")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Test Device",
      type: "light",
      status: "active",
    });

  expect(create.status).toBe(201);
  expect(create.body.success).toBe(true);
  expect(create.body.device).toHaveProperty("_id");
  expect(create.body.device.name).toBe("Test Device");

  //  Get devices list
  const list = await request(app)
    .get("/devices")
    .set("Authorization", `Bearer ${token}`);

  expect(list.status).toBe(200);
  expect(list.body.success).toBe(true);
  expect(Array.isArray(list.body.devices)).toBe(true);
  expect(list.body.devices.length).toBe(1);
  expect(list.body.devices[0]).toHaveProperty("name", "Test Device");
}, 10000);
