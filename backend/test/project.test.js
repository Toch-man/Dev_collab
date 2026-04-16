const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

describe("Project Routes", () => {
  let authToken;
  let ownerId;

  const testUser = {
    username: "tochukwu",
    email: "tochukwu@test.com",
    password: "password123",
    full_name: "okeakpu tochukwu",
    niche: "web developer",
  };

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL);
  }, 15000);

  beforeEach(async () => {
    // wipe DB
    const collections = mongoose.connection.collections;
    for (let key in collections) {
      await collections[key].deleteMany();
    }

    // register and login to get fresh token and userId for each test
    await request(app).post("/api/auth/register").send(testUser);
    const loginRes = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    authToken = loginRes.body.token;
    ownerId = loginRes.body.user._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  }, 15000);

  describe("POST /api/project/create_project", () => {
    test("should create a project", async () => {
      const res = await request(app)
        .post("/api/project/create_project")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          project_name: "agromarket",
          description: "agricultural ecommerce platform",
          owner: ownerId,
          member: [ownerId],
          isPublic: true,
          techStack: "web developer",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("project");
    });
  });

  describe("POST /api/project/send_invite", () => {
    test("can send invite", async () => {
      const projectRes = await request(app)
        .post("/api/project/create_project")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          project_name: "agromarket",
          description: "agricultural ecommerce platform",
          owner: ownerId,
          member: [ownerId],
          isPublic: true,
          techStack: "web developer",
        });

      const projectId = projectRes.body.project._id;

      const res = await request(app)
        .post("/api/project/send_invite")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          project_id: projectId,
          receiver_id: new mongoose.Types.ObjectId().toString(),
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
    });
  });
});
