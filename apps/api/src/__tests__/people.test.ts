import request from "supertest";
import { buildApp } from "../app";

describe("People API", () => {
  const app = buildApp();

  it("POST /api/people creates a person", async () => {
    const res = await request(app)
      .post("/api/people")
      .send({
        name: "Emma",
        dateOfBirth: "1990-05-10",
        placeOfBirth: "Helsinki",
      })
      .expect(201);

    expect(res.body.data).toBeDefined();
    expect(res.body.data.name).toBe("Emma");
    expect(res.body.data.placeOfBirth).toBe("Helsinki");
    expect(res.body.data.id).toBeTruthy();
  });

  it("POST /api/people rejects future dateOfBirth", async () => {
    const res = await request(app)
      .post("/api/people")
      .send({
        name: "Future Kid",
        dateOfBirth: "2999-01-01",
      })
      .expect(400);

    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe("DOB_IN_FUTURE");

  });
});
