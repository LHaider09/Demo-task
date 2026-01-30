import request from "supertest";
import { buildApp } from "../app";

describe("Relationships API", () => {
  const app = buildApp();

  async function createPerson(name: string, dob: string) {
    const res = await request(app)
      .post("/api/people")
      .send({ name, dateOfBirth: dob })
      .expect(201);

    return res.body.data.id as string;
  }

  it("POST /api/relationships creates a parent-child relationship", async () => {
    const parentId = await createPerson("Noah", "1960-01-01");
    const childId = await createPerson("Emma", "1990-01-01");

    const res = await request(app)
      .post("/api/relationships")
      .send({ parentId, childId })
      .expect(201);

    expect(res.body.data.parentId).toBe(parentId);
    expect(res.body.data.childId).toBe(childId);
  });

  it("rejects relationship if parent is not 15 years older", async () => {
    const parentId = await createPerson("Young Parent", "1980-01-01");
    const childId = await createPerson("Child", "1990-01-01"); // only 10 years

    const res = await request(app)
      .post("/api/relationships")
      .send({ parentId, childId })
      .expect(400);

    expect(res.body.error).toBeDefined();
    // adjust message/code based on your API error
    expect(res.body.error.code).toBe("AGE_RULE");
  });

  it("rejects cycles (child cannot become ancestor)", async () => {
    const a = await createPerson("A", "1960-01-01");
    const b = await createPerson("B", "1990-01-01");

    // A -> B (A is parent of B)
    await request(app)
      .post("/api/relationships")
      .send({ parentId: a, childId: b })
      .expect(201);

    // Try B -> A (cycle)
    const res = await request(app)
      .post("/api/relationships")
      .send({ parentId: b, childId: a })
      .expect(400);

    expect(res.body.error).toBeDefined();
    expect(["CYCLE", "AGE_RULE"]).toContain(res.body.error.code);

  });
});
