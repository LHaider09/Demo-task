import { Router } from "express";
import { ApiError } from "../errors/apiError";
import { createRelationshipSchema } from "../validation/relationships.schema";
import { createRelationship } from "../services/relationships.service";

export const relationshipsRouter = Router();

relationshipsRouter.post("/", async (req, res, next) => {
  try {
    const parsed = createRelationshipSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body", parsed.error.flatten());
    }

    const relationship = await createRelationship(parsed.data);
    res.status(201).json({ data: relationship });
  } catch (err) {
    next(err);
  }
});
