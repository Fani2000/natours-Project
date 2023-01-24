const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config();

const port = process.env.PORT || 3000;
const MongoUrl = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.uvujx8t.mongodb.net/natours?retryWrites=true&w=majority`;

mongoose.set('strictQuery', true)
mongoose
  .connect(MongoUrl)
  .then((result) => {
    // console.log(result);
    app.listen(port, () => {
      console.log(`App running on port ${port}...`);
    });
  })
  .catch((e) => {
    throw new Error("The server is down at the moment, try again later");
  });
