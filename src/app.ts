import express from "express";
import createHttpError, { HttpError } from "http-errors";

import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";

const app = express();
app.use(express.json());

// Routes
// Htpp methods: Get, POST, PUT, PATCH, DELETE
app.get("/", (req, res, next) => {
  res.json({ msg: "Welcome to elib api!" });
});

// Routes for user
app.use("/api/users", userRouter);

// Global error handler
app.use(globalErrorHandler);
export default app;
