import { Router } from "express";
import { createBook } from "./bookController";
const bookRouter = Router();

// routes
bookRouter.post("/", createBook);

export default bookRouter;
