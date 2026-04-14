require("dotenv").config;

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const cookieParser = require("cookie-parser");

const app = express();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/auth", require("./routes/auth_routes"));
app.use("/api/project", require("./routes/project_routes"));
app.use("api/tasks", require("./routes/task_routes"));

app.get("/test", (req, res) => {
  res.status(200).json({ message: "test route working" });
});

module.exports = app;
