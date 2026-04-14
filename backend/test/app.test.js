const request = require("supertest");
const app = require("../app");
describe("GET /test", async () => {
  const res = await request(app)
    .get("/test")
    .expect("Content-Type", /json/)
    .expect(200);
  expect(res.body.message).toBe("test route working");
});
