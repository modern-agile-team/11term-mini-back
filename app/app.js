"use strict";

const express = require("express");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
require("./src/passport")(passport);
app.use(passport.initialize());
app.use(morgan("dev"));
app.use("/uploads/users", express.static(`${__dirname}/uploads/users`));

const indexRouter = require("./src/routes");
const errorMiddleware = require("./src/middleware/error.middleware");

app.use("/", indexRouter);

app.use(errorMiddleware);

module.exports = app;
