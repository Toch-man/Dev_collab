const request = require("supertest");
const app = require("../app"); // adjust path

describe("Auth Routes", () => {
  const testUser = {
    username: "tochukwu",
    email: "okeakputochukwu9@.com",
    password: "password123",
    full_name: "okeakpu tochukwu",
    niche: "web developer",
  };

  //test db
  beforeAll(async () => {
    await connectDB(process.env.MONGO_URL);
  });

  //clean db before each test
  beforeEach(async () => {
    const collections = mongoose.connection.collections;

    for (let key in collections) {
      await collections[key].deleteMany();
    }
  });

  //close db after test
  afterAll(async () => {
    await mongoose.connection.close();
  });
  //  REGISTER
  describe("POST /api/auth/register", () => {
    test("should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
    });

    test("should not register with existing email", async () => {
      const res = await request(app).post("/api/auth/register").send(testUser);

      expect(res.statusCode).toBe(400);
    });
  });

  // LOGIN
  describe("POST /api/auth/login", () => {
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
