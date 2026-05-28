const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
   company_name: {
  type: String,
  trim: true,
  default: null,
},

    industry: {
      type: String,
      trim: true,
      default: null,
    },

    city: {
      type: String,
      trim: true,
      default: null,
    },

    state: {
      type: String,
      trim: true,
      default: null,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    website: {
      type: String,
      trim: true,
      default: null,
    },

    turnover: {
      type: Number,
      default: null,
    },

    country: {
      type: String,
      trim: true,
      default: null,
    },

    socialMedia: {
      type: String,
      trim: true,
      default: null,
    },

    companyOwnerName: {
      type: String,
      trim: true,
      default: null,
    },

    contacts: [
      {
        name: {
          type: String,
          trim: true,
          default: null,
        },

        position: {
          type: String,
          trim: true,
          default: null,
        },

        contactNumber: {
          type: String,
          trim: true,
          default: null,
        },

        email: {
          type: String,
          trim: true,
          lowercase: true,
          default: null,
        },
      },
    ],

    source: {
      type: String,
      enum: ["google_sheet", "mca", "manual", "csv", "excel"],
      default: "manual",
    },

    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],

    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UploadedFile",
      index: true,
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

// ======================================
// Indexes
// ======================================

companySchema.index({ fileId: 1, email: 1 });

companySchema.index({ fileId: 1, phone: 1 });

companySchema.index({ fileId: 1, city: 1 });

companySchema.index({ fileId: 1, industry: 1 });

companySchema.index({ company_name: 1 });

companySchema.index({ website: 1 });

module.exports = mongoose.model("Company", companySchema);
