
import type { Request, Response } from "express";
import * as relationshipsService from "../services/relationships.service";
import { asyncHandler } from "../utils/asyncHandler";

export const createRelationship = asyncHandler(async (req: Request, res: Response) => {
  const rel = await relationshipsService.createRelationship(req.body);
  res.status(201).json(rel);
});
