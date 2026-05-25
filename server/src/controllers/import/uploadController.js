const path = require("path");
const fs = require("fs");
const multer = require("multer");

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
  fs.mkdirSync(uploadDir, { recursive: true });
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
  const get = (keys) => {
    for (const key of keys) {
      const normalizedKey = normalize(key);

      const foundKey = Object.keys(row).find(
        (rk) => normalize(rk) === normalizedKey
      );

      if (
        foundKey &&
        row[foundKey] !== null &&
        row[foundKey] !== undefined &&
        String(row[foundKey]).trim() !== ""
      ) {
        return String(row[foundKey]).trim();
      }
    }

    return undefined;
  };

  return {
    company_name:
      get([
        "company_name",
        "company name",
        "company",
        "name",
      ]) || undefined,

    phone:
      get([
        "contact",
        "contact number",
        "phone",
        "mobile",
      ]) || undefined,

    website:
      get([
        "website",
        "url",
        "domain",
      ]) || undefined,

    email:
      get([
        "email",
        "email id",
        "emailid",
      ]) || undefined,

    source: "excel",
  };
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
          originalName: req.file.originalname,
        }).populate("uploadedBy");

      if (existingFile) {
        if (
          req.file.path &&
          fs.existsSync(req.file.path)
        ) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(400).json({
          message:
            "File with same name already uploaded",
        });
      }

      // =======================================
      // Parse File
      // =======================================

      const rows =
        await fileService.parseFile(
          req.file.path,
          req.file.mimetype
        );

      // =======================================
      // Map Data
      // =======================================

      const companies = rows
        .map((row) => mapRowToCompany(row))
        .filter(
          (c) =>
            c.company_name ||
            c.phone ||
            c.website ||
            c.email
        );

      // =======================================
      // Required company_name
      // =======================================

      const validCompanies = companies.filter(
        (c) => c.company_name
      );

      console.log(
        "Mapped Companies:",
        validCompanies.slice(0, 5)
      );

      // =======================================
      // Save Upload History
      // =======================================

      const uploadedDoc =
        await fileService.saveUploadedFile({
          fileName: req.file.filename,

          originalName:
            req.file.originalname,

          sourceType: path
            .extname(req.file.originalname)
            .replace(".", ""),

          totalRecords: rows.length,

          uploadedBy: req.user
            ? req.user._id
            : null,

          uploadPath: req.file.path,
        });

      // =======================================
      // Insert Data
      // =======================================

      const result =
        await companyService.bulkInsertCompanies(
          validCompanies,
          uploadedDoc._id
        );

      // =======================================
      // Response
      // =======================================

      return res.status(201).json({
        message: "File uploaded successfully",

        totalRows: rows.length,

        validRows: validCompanies.length,

        inserted: result.inserted,

        updated: result.updated,

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