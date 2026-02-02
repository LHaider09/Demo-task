import { Router } from "express";
import { getTreeByRoot } from "../controller/tree.controller"; 

export const treeRouter = Router();

treeRouter.get("/:rootId", getTreeByRoot);
