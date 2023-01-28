const mongoose = require('mongoose')

exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);

  if (req.params.id.length <= 0) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid ID",
    });
  } else {
    req.params.id = mongoose.Types.ObjectId(req.params.id);
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "fail",
      message: "Missing name or price",
    });
  }
  next();
};