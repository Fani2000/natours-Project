const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require("./models/tours");
const Review = require("./models/review");
const User = require("./models/user");

dotenv.config();

const port = process.env.PORT || 3000;

const MongoUrl = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.uvujx8t.mongodb.net/natours?retryWrites=true&w=majority`;

mongoose.set("strictQuery", true);
mongoose
  .connect(MongoUrl)
  .then((result) => {
    console.log("DB connection successful!");
  })
  .catch((e) => {
    throw new Error("The server is down at the moment, try again later");
  });

const tours = JSON.parse(
  fs.readFileSync(__dirname + "/dev-data/data/tours.json", "utf-8")
);
const users = JSON.parse(
  fs.readFileSync(__dirname + "/dev-data/data/users.json", "utf-8")
);
const reviews = JSON.parse(
  fs.readFileSync(__dirname + "/dev-data/data/reviews.json", "utf-8")
);
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);

    console.log("Data successfully loaded!");
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data successfully delete!");
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv.includes("--import")) {
  importData();
}

if (process.argv.includes("--delete")) {
  deleteData();
}
