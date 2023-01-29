const express = require("express");
const path = require('path')
const morgan = require("morgan");
const { rateLimit } = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const hpp = require("hpp");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const viewRouter = require("./routes/viewRoutes");
const errorController = require("./controllers/errorController");
const AppError = require("./utils/AppError");

const app = express();
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

// 1) MIDDLEWARES
app.use(helmet());
app.use(morgan("dev"));
app.use("/api", limiter);
app.use(express.json({ limit: "10kb" }));
app.use(mongoSanitize());
app.use(xssClean());
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsAverage",
      "ratingsQuantity",
      "difficulty",
      "price",
      "maxGroupSize",
    ],
  })
);

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
app.use('/', viewRouter)
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.get("*", (req, res, next) => {
  const errorMessage = `Can't find ${req.originalUrl} on this server!`;
  const status = "fail";

  const error = new AppError(errorMessage, 500);

  next(error);
});

app.use(errorController);

module.exports = app;
