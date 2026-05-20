const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      unique: true,
    },

    phone: {
      type: String,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    refreshToken: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ["admin", "sales", "marketing"],
      default: "sales",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);