import { Router } from "express";
import {
  createBook,
  getSingleBook,
  listBooks,
  updateBook,
} from "./bookController";
import multer from "multer";
import path from "node:path";
import authenticate from "../middlewares/authenticate";
const bookRouter = Router();

// file store local ->
const upload = multer({
  dest: path.resolve(__dirname, "../../public/data/uploads"),
  limits: { fileSize: 9 * 1024 * 1024 }, // 30mb
});
// routes
bookRouter.get("/", listBooks);

bookRouter.post(
  "/",
  authenticate,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    {
      name: "file",
      maxCount: 1,
    },
  ]),
  createBook
);
bookRouter.get("/:bookId", getSingleBook);
bookRouter.patch(
  "/:bookId",
  authenticate,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    {
      name: "file",
      maxCount: 1,
    },
  ]),
  updateBook
);

export default bookRouter;
