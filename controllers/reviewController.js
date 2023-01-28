const Review = require("../models/review");
const catchAsync = require("../utils/catchAsync");
const factory = require("../middlewares/handlerFactory");

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.getReview = factory.getOne(Review)
exports.createReview = factory.createOne(Review) 
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
