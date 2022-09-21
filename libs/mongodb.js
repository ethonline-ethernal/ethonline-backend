const mongoose = require(`mongoose`);
require("dotenv").config();

const connectDb = async () => {
  mongoose.connect(process.env.MONGO_URL);
  const connection = mongoose.connection;
  connection.on("error", (err) => {
    console.log(err);
    throw new Exception(err);
  });
};

module.exports = {
  connectDb,
};
