const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  phoneNumber: String,
  Time: {
    type: Date,
    require: false,
  },
  Distance: {
    type: String,
    require: false,
  },
  Location: {
    type: String,
    require: false,
  },
  MacAdd: {
    type: String,
    require: false,
  },
  Device: {
    type: String,
    require: false,
  },
  Power: {
    type: Number,
    require: false,
  },
  SignalForce: {
    type: String,
    require: false,
  },
});

module.exports = mongoose.model("users", userSchema);
