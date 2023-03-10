const User = require("../models/user");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { promisify } = require("util");
const Email = require('../utils/email')
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: process.env.EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    secure: true,
    httpOnly: true,
  };

  res.cookie("jwt", token, cookieOptions);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user,
    },
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

  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url)

  await new Email(newUser, url).sendWelcome()

  createSendToken(newUser, 200, res);
});

module.exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new AppError("Please provide email and password", 40));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password)))
    next(new AppError("Incorrect email or password", 401));

  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: "success",
  //   token,
  // });

  createSendToken(user, 200, res);
});

module.exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // prettier-ignore
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    token = req.headers.authorization.split(" ")[1]
  }else if(req.cookies.jwt){
    token = req.cookies.jwt
  }

  if (!token) {
    // prettier-ignore
    return next(new AppError('You are not logged n!Please log in to get access', 401))
  }

  // prettier-ignore
  const decodedPayload = await promisify(jwt.verify)(token, process.env.SECRET_KEY)

  const freshUser = await User.findById(decodedPayload.id);

  if (!freshUser) {
    return next(
      new AppError("The user belonging to the token no longer exists!")
    );
  }

  req.user = freshUser;
  next();
});

module.exports.isLoggedIn = async (req, res, next) => {
  let token;

  try {
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
      // prettier-ignore
      const decodedPayload = await promisify(jwt.verify)(token, process.env.SECRET_KEY)

      const currentUser = await User.findById(decodedPayload.id);

      if (!currentUser) {
        return next();
      }

      req.user = currentUser;
      res.locals.user = currentUser;
      return next();
    }
  } catch (e) {
    return next();
  }

  next();
};

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


  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: "Your password reset token is(valid for 10 min)",
    //   message,
    // });
    await new Email(user, resetURL).sendPasswordRest()

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (e) {
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;

    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("There ws an error sending the email. Try again later!", 500)
    );
  }
});

module.exports.resetPassword = catchAsync(async (req, res, next) => {
  // prettier-ignore
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // prettier-ignore
  if(!user) return next(new AppError('Token is invalid or expired', 400))

  user.password = req.body.password; // setting the password
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: "success",
  //   token,
  // });

  createSendToken(user, 200, res);
});

module.exports.updatePassword = catchAsync(async (req, res, next) => {
  const { confirmPassword, password, passwordCurrent } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  if (!user.correctPassword(passwordCurrent, user.password)) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  user.password = password;
  user.confirmPassword = confirmPassword;
  await user.save();

  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
  });
};
