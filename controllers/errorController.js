module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (req.originalUrl.startsWith("/api")) {
    if (process.env.NODE_ENV === "development") {
      res.status(err.statusCode).json({
        status: err.status,
        error: err,
        stack: err.stack,
        message: err.message,
      });
    } else if (process.env.NODE_ENV === "production") {
      console.log("ERROR 🔥", err);

      if (err.isOperational) {
        res.status(err.statusCode).json({
          status: err.status,
          message: err.message,
        });
      } else {
        res.status(err.statusCode).json({
          status: "error",
          message: "Something went very wrong!",
        });
      }
    }
  } else {
    res.status(400).render("error", {
      title: "Something went wrong!",
      msg: "Please try again later!, the current url is not found!"
    });
  }
};
