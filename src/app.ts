import express from "express";
import createHttpError, { HttpError } from "http-errors";

import globalErrorHandler from "./middlewares/globalErrorHandler";

const app = express();

// Routes
// Htpp methods: Get, POST, PUT, PATCH, DELETE
app.get("/", (req, res, next) => {
  
  res.json({ msg: "Welcome to elib api!" });
});

// Global error handler
app.use(globalErrorHandler);
export default app;
