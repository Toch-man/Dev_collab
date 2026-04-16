const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

describe("Auth Routes", () => {
  const testUser = {
    username: "tochukwu",
    email: "okeakputochukwu9@gmail.com",
    password: "password123",
    full_name: "okeakpu tochukwu",
    niche: "web developer",
  };

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL);
  }, 15000);

  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (let key in collections) {
      await collections[key].deleteMany();
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  }, 15000);

  describe("POST /api/auth/sign_up", () => {
    test("should register a new user", async () => {
      const res = await request(app).post("/api/auth/sign_up").send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
    });

    test("should not register with existing email", async () => {
      await request(app).post("/api/auth/sign_up").send(testUser);

      const res = await request(app).post("/api/auth/sign_up").send(testUser);

      expect(res.statusCode).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/sign_up").send(testUser);
    });

    test("should login user with correct credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    test("should fail with wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "wrongpassword",
      });

      expect(res.statusCode).toBe(401);
    });

    test("should fail with non-existing user", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "nouser@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(404);
    });
  });
});
