const Tour = require("../models/tours");
const User = require("../models/user");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render("overview", { title: "All Tours", tours });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate({
    path: "reviews",
    fields: "review rating user",
  });

  if (!tour) {
    return next(new AppError("There is no tour with that name", 400));
  }

  res.status(200).render("tour", { title: tour.name + " Tour", tour });
});

exports.getLogin = (req, res, next) => {
  res.status(200).render("login", {
    title: "Log into you account",
  });
};

exports.getAccount = (req, res, next) => {
  res.status(200).render("account", {
    title: "Log into you account",
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  // console.log("USER DATA", req.body);
  const { username, email } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: username,
      email,
    },
    { new: true, runValidators: true }
  );

  console.log(user);

  res.status(200).render('account', {
    title: 'User Details',
    user
  })
});
