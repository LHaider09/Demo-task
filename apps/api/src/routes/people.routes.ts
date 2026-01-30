import { Router } from "express";
import { createPersonSchema } from "../validation/people.schema";
import { ApiError } from "../errors/apiError";
import { createPerson, listPeople } from "../services/people.service";

export const peopleRouter = Router();

peopleRouter.get("/", async (_req, res, next) => {
  try {
    const people = await listPeople();
    res.json({ data: people });
  } catch (err) {
    next(err);
  }
});

peopleRouter.post("/", async (req, res, next) => {
  try {
    const parsed = createPersonSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body", parsed.error.flatten());
    }

    const person = await createPerson(parsed.data);
    res.status(201).json({ data: person });
  } catch (err) {
    next(err);
  }
});
