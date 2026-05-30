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

    socialMedia: get([
      "social media",
      "social",
      "linkedin",
      "facebook",
      "instagram",
      "twitter",
      "x",
      "social link",
      "social profile",
    ]),

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
      // Parse File
      // =======================================

      console.log(`[UPLOAD] Parsing file: ${req.file.originalname}`);
      const parseStart = Date.now();

      const rows =
        await fileService.parseFile(
          req.file.path,
          req.file.mimetype
        );

      console.log(`[UPLOAD] Parsed ${rows.length} total rows in ${Date.now() - parseStart}ms`);

      // =======================================
      // Map Companies
      // =======================================

      const mapStart = Date.now();
      const companies = rows
        .map((row) =>
          mapRowToCompany(row)
        )
        .filter(
          (c) =>
            Object.keys(c).length > 1
        );

      // =======================================
      // In-Memory Deduplication (Across Sub-sheets)
      // =======================================

      const uniqueCompaniesMap = new Map();
      
      companies.forEach((c) => {
        if (!c.company_name) return;
        
        // Use company_name as primary unique key within the file
        // To be safe, we also append email and website if they exist
        const key = (c.company_name || "").toLowerCase().trim() + "|" + 
                    (c.email || "").toLowerCase().trim() + "|" + 
                    (c.website || "").toLowerCase().trim();
        
        if (!uniqueCompaniesMap.has(key)) {
          uniqueCompaniesMap.set(key, c);
        }
      });
      
      const uniqueCompanies = Array.from(uniqueCompaniesMap.values());
      const inMemoryDuplicatesSkipped = companies.length - uniqueCompanies.length;

      if (inMemoryDuplicatesSkipped > 0) {
        console.log(`[UPLOAD] Skipped ${inMemoryDuplicatesSkipped} in-memory duplicates across sheets.`);
      }

      // =======================================
      // Data-Level Duplicate Check
      // =======================================

      const dupCheck =
        await companyService.checkDuplicateData(
          uniqueCompanies
        );

      // If ALL records are duplicates, reject the upload entirely
      if (
        dupCheck.duplicateCount > 0 &&
        dupCheck.duplicateCount >=
          dupCheck.totalChecked
      ) {
        // Clean up the uploaded file
        if (
          req.file.path &&
          fs.existsSync(req.file.path)
        ) {
          fs.unlinkSync(req.file.path);
        }

        // Build duplicate details for error response
        const duplicateDetails =
          dupCheck.duplicates
            .slice(0, 10)
            .map((d) => ({
              company_name: d.company_name,
              email: d.email,
              website: d.website,
            }));

        return res.status(409).json({
          success: false,

          message:
            "This data already exists in the database. All " +
            dupCheck.duplicateCount +
            " records from this file are duplicates.",

          error:
            "Data already exists! Even after renaming the file, the data inside matches existing records.",

          duplicateCount:
            dupCheck.duplicateCount,

          totalRecords:
            dupCheck.totalChecked,

          duplicateDetails,
        });
      }

      // If SOME records are duplicates, filter them out
      let companiesToInsert = uniqueCompanies;
      let skippedDuplicates = 0;

      if (dupCheck.duplicateCount > 0) {
        const dupSet = new Set(
          dupCheck.duplicates.map(
            (d) =>
              (d.company_name || "")
                .toLowerCase()
                .trim() +
              "|" +
              (d.email || "")
                .toLowerCase()
                .trim() +
              "|" +
              (d.website || "")
                .toLowerCase()
                .trim()
          )
        );

        companiesToInsert = uniqueCompanies.filter(
          (c) => {
            const key =
              (c.company_name || "")
                .toLowerCase()
                .trim() +
              "|" +
              (c.email || "")
                .toLowerCase()
                .trim() +
              "|" +
              (c.website || "")
                .toLowerCase()
                .trim();

            return !dupSet.has(key);
          }
        );

        skippedDuplicates =
          dupCheck.duplicateCount;
      }

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
      // Insert Companies (non-duplicates only)
      // =======================================

      const result =
        await companyService.bulkInsertCompanies(
          companiesToInsert,
          uploadedDoc._id
        );

      // =======================================
      // Response
      // =======================================

      return res.status(201).json({
        success: true,

        message:
          (skippedDuplicates + inMemoryDuplicatesSkipped) > 0
            ? "File uploaded with " +
              (skippedDuplicates + inMemoryDuplicatesSkipped) +
              " duplicate records skipped"
            : "File uploaded successfully",

        totalRows: rows.length,

        processedRows:
          companiesToInsert.length,

        inserted: result.inserted,

        updated: result.updated,

        skippedDuplicates,

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