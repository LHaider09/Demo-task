import request from "supertest";
import { buildApp } from "../app";
import { prisma } from "../prisma";

describe("Relationships API", () => {
  const app = buildApp();

  beforeEach(async () => {
    await prisma.relationship.deleteMany();
    await prisma.person.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function createPerson(name: string, dob: string) {
    const res = await request(app)
      .post("/api/people")
      .send({ name, dateOfBirth: dob })
      .expect(201);

    // Handle both { data: person } and raw person response styles
    return res.body.data?.id || res.body.id;
  }

  it("POST /api/relationships creates a parent-child relationship", async () => {
    const parentId = await createPerson("Noah", "1960-01-01");
    const childId = await createPerson("Emma", "1990-01-01");

    const res = await request(app)
      .post("/api/relationships")
      .send({ parentId, childId })
      .expect(201);

    const data = res.body.data || res.body;
    expect(data.parentId).toBe(parentId);
    expect(data.childId).toBe(childId);
  });

  it("rejects relationship if parent is not 15 years older", async () => {
    const parentId = await createPerson("Young Parent", "1980-01-01");
    const childId = await createPerson("Child", "1990-01-01"); // Only 10 years diff

    const res = await request(app)
      .post("/api/relationships")
      .send({ parentId, childId })
      .expect(400);

    // Expect specific error code from your service
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe("AGE_RULE");
  });

  it("rejects cycles (immediate parent-child swap)", async () => {
    const a = await createPerson("A", "1960-01-01");
    const b = await createPerson("B", "1990-01-01");

    // A -> B (Valid)
    await request(app)
      .post("/api/relationships")
      .send({ parentId: a, childId: b })
      .expect(201);

    // B -> A (Invalid: Cycle + Age Rule violation)
    const res = await request(app)
      .post("/api/relationships")
      .send({ parentId: b, childId: a })
      .expect(400);
    expect(["CYCLE", "AGE_RULE"]).toContain(res.body.error.code);
  });

  it("validates grandfather lineage (A -> B -> C)", async () => {
    const grandpa = await createPerson("Grandpa", "1940-01-01");
    const dad = await createPerson("Dad", "1970-01-01");
    const son = await createPerson("Son", "2000-01-01");

    // Grandpa -> Dad
    await request(app)
      .post("/api/relationships")
      .send({ parentId: grandpa, childId: dad })
      .expect(201);

    // Dad -> Son
    await request(app)
      .post("/api/relationships")
      .send({ parentId: dad, childId: son })
      .expect(201);
      
    const relationships = await prisma.relationship.findMany();
    expect(relationships).toHaveLength(2);
  });
    it("rejects self-parent relationships", async () => {
    const a = await createPerson("A", "1980-01-01");

    const res = await request(app)
      .post("/api/relationships")
      .send({ parentId: a, childId: a })
      .expect(400);

    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe("SELF_PARENT");
  });

  it("rejects a third parent (max 2 parents rule)", async () => {
    const p1 = await createPerson("Parent 1", "1960-01-01");
    const p2 = await createPerson("Parent 2", "1961-01-01");
    const p3 = await createPerson("Parent 3", "1962-01-01");
    const child = await createPerson("Child", "1995-01-01");

    // First parent OK
    await request(app)
      .post("/api/relationships")
      .send({ parentId: p1, childId: child })
      .expect(201);

    // Second parent OK
    await request(app)
      .post("/api/relationships")
      .send({ parentId: p2, childId: child })
      .expect(201);

    // Third parent should fail
    const res = await request(app)
      .post("/api/relationships")
      .send({ parentId: p3, childId: child })
      .expect(400);

    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe("TOO_MANY_PARENTS");
  });

  it("rejects duplicate relationships (same parent-child twice)", async () => {
    const parentId = await createPerson("Noah", "1960-01-01");
    const childId = await createPerson("Emma", "1990-01-01");

    // First time OK
    await request(app)
      .post("/api/relationships")
      .send({ parentId, childId })
      .expect(201);

    // Second time should fail as DUPLICATE
    const res = await request(app)
      .post("/api/relationships")
      .send({ parentId, childId })
      .expect(409);

    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe("DUPLICATE");
  });

});