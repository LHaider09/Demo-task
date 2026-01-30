import { Router } from "express";
import { z } from "zod";
import { ApiError } from "../errors/apiError";
import { getTree } from "../services/tree.service";

export const treeRouter = Router();

treeRouter.get("/:rootId", async (req, res, next) => {
  try {
    const rootId = req.params.rootId;

    const idCheck = z.string().uuid().safeParse(rootId);
    if (!idCheck.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "rootId must be a valid UUID");
    }

    const tree = await getTree(rootId);
    res.json({ data: tree });
  } catch (err) {
    next(err);
  }
});
