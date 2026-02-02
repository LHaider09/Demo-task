import type { Request, Response } from "express";
import * as peopleService from "../services/people.service";
import { asyncHandler } from "../utils/asyncHandler";
import { createPersonSchema } from "../validation/people.schema";
import { ApiError } from "../errors/apiError";

export const createPerson = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createPersonSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body", parsed.error.flatten());
  }

  const person = await peopleService.createPerson(parsed.data);
  return res.status(201).json({ data: person });
});

export const listPeople = asyncHandler(async (_req: Request, res: Response) => {
  const people = await peopleService.listPeople();
  return res.json({ data: people }); 
});
