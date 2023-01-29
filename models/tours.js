const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const toursSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name."],
      unique: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: Number,
    price: {
      type: Number,
      required: [true, "a tour must have a price."],
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    startLocation: {
      type: { type: String, default: "Point", enum: ["Point"] },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: { type: String, default: "Point", enum: ["Point"] },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

toursSchema.index({ price: 1, ratingsAverage: -1 });
toursSchema.index({ startLocation: '2dsphere' });

toursSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

toursSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });

  next();
});

const Tour = mongoose.model("Tour", toursSchema);

module.exports = Tour;
