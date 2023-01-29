const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    rating: { type: Number, min: 1, max: 5 },
    tour: {
      type: mongoose.Types.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour."],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
    review: { type: String, required: [true, "Review can not be empty!"] },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "tour",
    select: "name",
  });

  this.populate({
    path: "user",
    select: "name photo",
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function (tour) {
  const stats = await this.aggregate([
    {
      $match: { tour },
    },
    {
      $group: {
        _id: "$tour",
        numRating: {
          $sum: 1,
        },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);
  console.log(stats);
};

// reviewSchema.pre("save", (next) => {
//   this.constructor.calcAverageRatings(this.tour);
//   next();
// });

// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   this.r = await this.findOne();
//   console.log(this.r);
//   next();
// });

// reviewSchema.post(/^findOneAnd/, async function (next) {
//   await this.r.constructor.calcAverageRatings(this.r.tour);
//   next();
// });

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
