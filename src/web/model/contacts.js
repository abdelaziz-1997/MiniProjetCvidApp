const mongoose = require("mongoose");

const contactSchema = mongoose.Schema({
  tracking: Object,
  uid: String,
  status: Number,
  createdAt: Date,
  deletedAt: Date,
  phone: {
    type: String,
    require: false,
  },
});

// export model user with UserSchema
module.exports = mongoose.model("contacts", contactSchema);
