const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
// Replace this with your MONGOURI.
const MONGOURI = "mongodb://localhost/marocvid19";

const InitiateMongoServer = async () => {
  try {
    await mongoose.connect(MONGOURI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = InitiateMongoServer;
