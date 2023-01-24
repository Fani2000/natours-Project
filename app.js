const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const errorController = require("./controllers/errorController");
const AppError = require("./utils/AppError");

const app = express();

// 1) MIDDLEWARES
// if (process.env.NODE_ENV === "development") {
app.use(morgan("dev"));
// }

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//   console.log("Hello from the middleware 👋");
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.get("*", (req, res, next) => {
  const errorMessage = `Can't find ${req.originalUrl} on this server!`;
  const status = "fail";

  const error = new AppError(errorMessage, statusCode);

  next(error);
});

app.use(errorController);

module.exports = app;
