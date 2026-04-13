require("dotenv").config;

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookie_parser = require("cookie-parser");
const cookieParser = require("cookie-parser");

const app = express();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/auth", require("./routes/auth_routes"));
app.use("/api/project", require("./routes/project_routes"));
app.use("api/tasks", require("./routes/task_routes"));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
