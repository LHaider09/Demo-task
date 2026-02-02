import { Router } from "express";
import { getTreeByRoot } from "../controller/tree.controller"; // or ../controllers/...

export const treeRouter = Router();

treeRouter.get("/:rootId", getTreeByRoot);
