var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
const db = require("./config/db");

var indexRouter = require("./routes/index");
var authRouter = require("./routes/auth");
var usersRouter = require("./routes/users");

var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/users", usersRouter);

app.get("/health", function (req, res) {
  db.testConnection()
    .then(function () {
      res.json({ status: "ok", database: "connected" });
    })
    .catch(function (err) {
      res.status(503).json({
        status: "error",
        database: "disconnected",
        message: err.message,
      });
    });
});

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
