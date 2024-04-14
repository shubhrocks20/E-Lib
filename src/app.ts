import express from "express";

const app = express();

// Routes
// Htpp methods: Get, POST, PUT, PATCH, DELETE
app.get("/", (req, res, next) => {
  res.json({ msg: "Welcome to elib api!" });
});
export default app;
