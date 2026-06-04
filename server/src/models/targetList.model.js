const mongoose = require("mongoose");

const targetListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    filters: {
      type: mongoose.Schema.Types.Mixed, // Store the raw filter object used to create the list
      default: {},
    },
    companies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TargetList", targetListSchema);
