const mongoose = require("mongoose");

const uploadedFileSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    originalName: { type: String },
    sourceType: { type: String, default: "csv" },
    totalRecords: { type: Number, default: 0 },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    uploadPath: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("UploadedFile", uploadedFileSchema);
