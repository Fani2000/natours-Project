const User = require("../models/user");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { promisify } = require("util");
const sendEmail = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: process.env.EXPIRES_IN,
  });
};

module.exports.signup = catchAsync(async (req, res, next) => {
  const {
    email,
    name,
    password,
    confirmPassword,
    photo,
    passwordChangedAt,
    role,
  } = req.body;

  const newUser = await User.create({
    email,
    name,
    password,
    confirmPassword,
    photo,
    passwordChangedAt,
    role,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

module.exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new AppError("Please provide email and password", 40));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password)))
    next(new AppError("Incorrect email or password", 401));

  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

module.exports.protect = catchAsync(async (req, res, next) => {
  // console.log("Protected route 🔑")
  let token;
  // prettier-ignore
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    token = req.headers.authorization.split(" ")[1]
    // console.log('TOKEN 🗝️ ', token)
  }

  if (!token) {
    // prettier-ignore
    return next(new AppError('You are not logged n!Please log in to get access', 401))
  }

  // prettier-ignore
  const decodedPayload = await promisify(jwt.verify)(token, process.env.SECRET_KEY)

  const freshUser = await User.findById(decodedPayload.id);
  // console.log("USE 👤", freshUser);

  if (!freshUser) {
    return next(
      new AppError("The user belonging to the token no longer exists!")
    );
  }

  if (freshUser.changedPasswordAfter(decodedPayload.iat)) {
    // prettier-ignore
    return next(new AppError('User recently changed password! Please log in again.', 401))
  }

  // console.log("Token", req.token);
  req.user = freshUser;
  next();
});

module.exports.restrictTo = (...roles) =>
  catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // prettier-ignore
      return next(new AppError('You do not have permission to perform this action', 403))
    }
    next();
  });

module.exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // console.log(user)
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token is(valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (e) {
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;

    await user.save({ validateBeforeSave: false });
  return next(new AppError('There ws an error sending the email. Try again later!', 500))
  }
});

module.exports.resetPassword = catchAsync(async (req, res, next) => {
  console.log(req.params.token);
});