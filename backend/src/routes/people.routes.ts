import { Router } from "express";
import { createPerson, listPeople } from "../controller/people.controller";

export const peopleRouter = Router();

peopleRouter.post("/", createPerson);
peopleRouter.get("/", listPeople);
