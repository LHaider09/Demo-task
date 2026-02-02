import type { Request, Response } from "express";
import * as treeService from "../services/tree.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../errors/apiError";

export const getTreeByRoot = asyncHandler(async (req: Request, res: Response) => {
  const rootId = String(req.params.rootId || "").trim();

  if (!rootId) {
    throw new ApiError(400, "VALIDATION_ERROR", "rootId is required");
  }

  const tree = await treeService.getTree(rootId);
  res.json(tree);
});

