const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { Worker } = require("worker_threads");

const fileService = require("../../services/fileService");
const companyService = require("../../services/companyService");

const UploadedFile = require("../../models/uploadedFile.model");

// =======================================
// Upload Directory
// =======================================

const uploadDir = path.join(
  process.cwd(),
  "server",
  "uploads"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

// =======================================
// Multer Storage
// =======================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const unique =
      Date.now() +
      "-" +
      file.originalname.replace(/\s+/g, "_");

    cb(null, unique);
  },
});

const upload = multer({ storage });

// =======================================
// Normalize Function
// =======================================

const normalize = (str) =>
  String(str || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");

// =======================================
// Row Mapping
// =======================================

const mapRowToCompany = (row) => {
  // =======================================
  // Smart Getter
  // =======================================

  const get = (keys) => {
    const normalizedRowKeys = Object.keys(row);

    for (const key of keys) {
      const normalizedKey = normalize(key);

      const foundKey = normalizedRowKeys.find((rk) => {
        const normalizedRowKey = normalize(rk);

        return (
          normalizedRowKey === normalizedKey ||
          normalizedRowKey.includes(normalizedKey) ||
          normalizedKey.includes(normalizedRowKey)
        );
      });

      if (
        foundKey &&
        row[foundKey] !== null &&
        row[foundKey] !== undefined
      ) {
        const value = String(row[foundKey]).trim();

        if (
          value !== "" &&
          value !== "-" &&
          value !== "--" &&
          value.toLowerCase() !== "nan" &&
          value.toLowerCase() !== "null" &&
          value.toLowerCase() !== "undefined" &&
          value.toLowerCase() !== "n/a"
        ) {
          return value;
        }
      }
    }

    return undefined;
  };

  // =======================================
  // Company Data
  // =======================================

  const company = {
    company_name: get([
      "company_name",
      "company name",
      "company",
      "business name",
      "organization",
      "organisation",
      "firm",
      "name",
    ]),

    phone: get([
      "phone",
      "mobile",
      "contact",
      "contact no",
      "contact no.",
      "contact number",
      "company phone",
      "company mobile",
      "telephone",
      "tel",
      "office number",
      "office phone",
    ]),

    website: get([
      "website",
      "website url",
      "site",
      "company website",
      "url",
      "domain",
      "web",
    ]),

    email: get([
      "email",
      "email id",
      "emailid",
      "mail",
      "company email",
      "official email",
    ]),

    industry: get([
      "industry",
      "business type",
      "sector",
      "category",
      "domain",
    ]),

    city: get([
      "city",
      "town",
      "location",
      "district",
    ]),

    state: get([
      "state",
      "province",
      "region",
    ]),

    country: get([
      "country",
      "nation",
    ]),

    // Social Media will be handled below via full row scan
    socialMedia: {
        facebook: [],
        youtube: [],
        instagram: [],
        x: [],
        linkedin: []
    },

    companyOwnerName: get([
      "owner",
      "owner name",
      "company owner",
      "business owner",
      "founder",
      "founder name",
      "ceo",
      "director",
      "managing director",
      "proprietor",
    ]),

    turnover: get([
      "turnover",
      "revenue",
      "annual revenue",
      "income",
      "sales",
    ]),

    source: "excel",
  };

  // =======================================
  // Employee / Contact Data
  // =======================================

  const employeeName = get([
    "employee name",
    "employee",
    "staff name",
    "contact person",
    "person name",
    "representative",
    "employee fullname",
    "contact name",
  ]);

  const employeePosition = get([
    "employee position",
    "designation",
    "position",
    "job title",
    "role",
    "employee role",
  ]);

  const employeePhone = get([
    "employee contact",
    "employee phone",
    "employee mobile",
    "employee number",
    "employee contact number",
    "employee contact no",
    "employee contact no.",
    "contact no",
    "contact no.",
    "contact number",
    "mobile number",
    "phone number",
    "employee telephone",
  ]);

  const employeeEmail = get([
    "employee email",
    "employee mail",
    "contact email",
    "person email",
    "staff email",
  ]);

  // =======================================
  // Contacts
  // =======================================

  if (
    employeeName ||
    employeePosition ||
    employeePhone ||
    employeeEmail
  ) {
    company.contacts = [
      {
        name: employeeName || null,
        position: employeePosition || null,
        contactNumber: employeePhone || null,
        email: employeeEmail || null,
      },
    ];
  }

  // =======================================
  // Remove Empty Fields
  // =======================================

  Object.keys(company).forEach((key) => {
    if (
      company[key] === undefined ||
      company[key] === null ||
      company[key] === ""
    ) {
      delete company[key];
    }
  });

  // =======================================
  // Extract Social Media Links
  // =======================================
  
  // Create a concatenated string of all values in the row to scan for URLs
  const rowString = Object.values(row)
    .filter(val => val !== null && val !== undefined)
    .join(" ");

  const extractLinks = (regex) => {
    const matches = [...rowString.matchAll(regex)];
    const uniqueUrls = [...new Set(matches.map(m => m[0].trim()))].slice(0, 3);
    return uniqueUrls.map(url => ({ url, username: "" }));
  };

  // Regular expressions to match platforms (case insensitive)
  const fbRegex = /https?:\/\/(www\.)?(facebook\.com|fb\.com)\/[a-zA-Z0-9.-]+/gi;
  const ytRegex = /https?:\/\/(www\.)?youtube\.com\/(channel\/|user\/|c\/|@)?[a-zA-Z0-9_-]+/gi;
  const igRegex = /https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._-]+/gi;
  const xRegex = /https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+/gi;
  const liRegex = /https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+/gi;

  if (company.socialMedia) {
    company.socialMedia.facebook = extractLinks(fbRegex);
    company.socialMedia.youtube = extractLinks(ytRegex);
    company.socialMedia.instagram = extractLinks(igRegex);
    company.socialMedia.x = extractLinks(xRegex);
    company.socialMedia.linkedin = extractLinks(liRegex);
  }

  return company;
};

// =======================================
// Upload Handler
// =======================================

const uploadHandler = [
  upload.single("file"),

  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      // =======================================
      // Duplicate File Check
      // =======================================

      const existingFile =
        await UploadedFile.findOne({
          originalName:
            req.file.originalname,
        });

      if (existingFile) {
        if (
          req.file.path &&
          fs.existsSync(req.file.path)
        ) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(400).json({
          message:
            "This file already exists with file name: " +
            req.file.originalname,
        });
      }

      // =======================================
      // Create Initial Upload History record (Pending)
      // =======================================

      const uploadedDoc =
        await fileService.saveUploadedFile({
          fileName: req.file.filename,
          originalName: req.file.originalname,
          sourceType: path
            .extname(req.file.originalname)
            .replace(".", ""),
          totalRecords: 0, // Will be updated by worker thread once parsed
          uploadedBy: req.user ? req.user._id : null,
          uploadPath: req.file.path,
        });

      // Update file status to pending explicitly
      uploadedDoc.status = "pending";
      uploadedDoc.progress = 0;
      await uploadedDoc.save();

      // =======================================
      // Spawn Worker Thread for Processing
      // =======================================

      const workerPath = path.resolve(__dirname, "../../workers/importWorker.js");
      console.log(`[MAIN THREAD] Spawning worker thread for file upload pipeline: ${req.file.originalname}`);

      const worker = new Worker(workerPath, {
        workerData: {
          filePath: req.file.path,
          fileId: uploadedDoc._id.toString(),
          MONGO_URI: process.env.MONGO_URI,
          mimetype: req.file.mimetype,
        },
      });

      // Main Thread listeners (Fail-safe logging and backup error recovery)
      worker.on("message", (msg) => {
        console.log(`[MAIN THREAD] Worker message from file ${uploadedDoc.originalName}:`, msg);
      });

      worker.on("error", (err) => {
        console.error(`[MAIN THREAD] Worker thread crashed for file ${uploadedDoc.originalName}:`, err);
        UploadedFile.findByIdAndUpdate(uploadedDoc._id, {
          status: "failed",
          errorMessage: err.message || "Background worker encountered an unexpected execution error.",
          progress: 100,
        }).catch((dbErr) => {
          console.error(`[MAIN THREAD] Failed to log worker error to database:`, dbErr);
        });
      });

      worker.on("exit", (code) => {
        console.log(`[MAIN THREAD] Worker thread for file ${uploadedDoc.originalName} finished with exit code ${code}`);
      });

      // =======================================
      // Return Success Response Instantly
      // =======================================

      return res.status(201).json({
        success: true,
        message: "File uploaded successfully. Import process started.",
        file: uploadedDoc,
      });
    } catch (error) {
      console.error(
        "UPLOAD ERROR:",
        error
      );

      next(error);
    }
  },
];

module.exports = {
  uploadHandler,
};