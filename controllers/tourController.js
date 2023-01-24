const Tour = require("../models/tours");
const fs = require("fs");
const catchAsync = require("../utils/catchAsync");
const { default: mongoose } = require("mongoose");
const AppError = require("../utils/AppError");

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

exports.getAllTours = catchAsync(async (req, res, next) => {
  // BUILD QUERY
  // 1. Filtering
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]); // Delete all the excluded fields

  // 2. ADVANCED FILTERING
  let queryStr = JSON.stringify(queryObj);
  queryString = queryStr.replace(
    /\b(gte|gt|lte|lt)\b/g,
    (match) => `$${match}`
  );

  let _query = Tour.find(JSON.parse(queryStr));

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    _query = _query.sort(sortBy);
  } else {
    _query = _query.sort("-createdAt");
  }

  const page = req.query.page * 1;
  const limit = req.query.limit * 1;
  const skip = (page - 1) * limit;

  // console.log(_query, skip, limit, page)
  _query = _query.skip(skip).limit(limit);
  // console.log(await _query)

  // EXECUTE QUERY
  const tours = await _query;

  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ _id: req.params.id });

  if (!tour) {
    return next(new AppError("No tour found with that ID", 404));
  }

  console.log(tour);

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const updatedTour = await Tour.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedTour) {
    return next(new AppError("No tour found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      tour: updatedTour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const deletedTour = await Tour.findOneAndDelete(req.params.id);

  if (!deletedTour) {
    return next(new AppError("No tour found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
