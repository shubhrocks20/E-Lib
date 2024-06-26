import express from "express";
import createHttpError, { HttpError } from "http-errors";

import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";
import bookRouter from "./book/bookRouter";
import cors from "cors";
import { config } from "./config/config";
const app = express();
app.use(
  cors({
    origin: config.frontend_domain,
  })
);
app.use(express.json());

// Routes
// Htpp methods: Get, POST, PUT, PATCH, DELETE
app.get("/", (req, res, next) => {
  res.json({ msg: "Welcome to elib api!" });
});

// Routes for user
app.use("/api/users", userRouter);
// Routes for books
app.use("/api/books", bookRouter);

// Global error handler
app.use(globalErrorHandler);
export default app;
