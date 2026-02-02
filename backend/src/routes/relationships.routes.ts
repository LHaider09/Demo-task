import { Router } from "express";
import { createRelationship } from "../controller/relationships.controller";

export const relationshipsRouter = Router();

relationshipsRouter.post("/", createRelationship);
