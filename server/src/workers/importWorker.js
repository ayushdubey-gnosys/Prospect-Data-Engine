const { parentPort, workerData } = require("worker_threads");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const fileService = require("../services/fileService");
const companyService = require("../services/companyService");
const UploadedFile = require("../models/uploadedFile.model");

const { filePath, fileId, MONGO_URI, mimetype } = workerData;

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
// Worker Main Thread Execution
// =======================================
const run = async () => {
  let dbConnection = null;
  try {
    console.log(`[WORKER] Starting background import task for File ID: ${fileId}`);
    
    // 1. Establish database connection for the worker
    dbConnection = await mongoose.connect(MONGO_URI);
    console.log(`[WORKER] Connected to MongoDB for file: ${fileId}`);

    // Update status to processing
    await UploadedFile.findByIdAndUpdate(fileId, {
      status: "processing",
      progress: 2,
    });

    // 2. Parse File
    if (!fs.existsSync(filePath)) {
      throw new Error(`Physical file not found at path: ${filePath}`);
    }

    console.log(`[WORKER] Parsing file at path: ${filePath}`);
    const rows = await fileService.parseFile(filePath, mimetype);
    console.log(`[WORKER] Parsed ${rows.length} total rows from file.`);

    // 3. Map Companies and Filter out invalid/empty ones
    const companies = rows
      .map((row) => mapRowToCompany(row))
      .filter((c) => Object.keys(c).length > 1 && c.company_name);

    await UploadedFile.findByIdAndUpdate(fileId, {
      totalRecords: companies.length, // Update strictly to valid companies
      progress: 5,
    });

    // 4. In-Memory Deduplication (Only consider duplicates when BOTH city and email match)
    const uniqueCompanies = [];
    const pairSet = new Set();
    let inMemoryDuplicatesSkipped = 0;

    companies.forEach((c) => {
      const city = c.city && String(c.city).toLowerCase().trim();
      const email = c.email && String(c.email).toLowerCase().trim();

      if (city && email) {
        const key = `${city}|${email}`;
        if (pairSet.has(key)) {
          inMemoryDuplicatesSkipped++;
          return; // Skip duplicate in-file when both city+email already present
        }
        pairSet.add(key);
      }

      uniqueCompanies.push(c);
    });

    console.log(`[WORKER] Unique companies to process: ${uniqueCompanies.length} (${inMemoryDuplicatesSkipped} in-memory duplicates skipped)`);

    await UploadedFile.findByIdAndUpdate(fileId, {
      progress: 10,
    });

    // If no valid companies found, complete immediately
    if (uniqueCompanies.length === 0) {
      await UploadedFile.findByIdAndUpdate(fileId, {
        status: "completed",
        progress: 100,
        processedRecords: 0,
        skippedDuplicates: inMemoryDuplicatesSkipped,
      });
      console.log(`[WORKER] Completed task. No companies found to import.`);
      parentPort.postMessage({ success: true, inserted: 0, updated: 0 });
      return;
    }

    // 5. Chunked Processing & DB insertions
    const CHUNK_SIZE = 2000;
    let totalInserted = 0;
    let totalUpdated = 0;
    let totalSkippedDuplicates = inMemoryDuplicatesSkipped;
    let processedSoFar = 0;

    for (let i = 0; i < uniqueCompanies.length; i += CHUNK_SIZE) {
      const chunk = uniqueCompanies.slice(i, i + CHUNK_SIZE);

      // Check duplicates for this chunk based on city+email
      const dupCheck = await companyService.checkDuplicateData(chunk);

      // Filter out duplicate records (existing city+email pairs)
      let chunkToInsert = chunk;
      if (dupCheck.duplicateCount > 0) {
        const dupSet = new Set(
          dupCheck.duplicates
            .filter((d) => d.city && d.email)
            .map((d) => `${String(d.city).toLowerCase().trim()}|${String(d.email).toLowerCase().trim()}`)
        );

        chunkToInsert = chunk.filter((c) => {
          const city = c.city && String(c.city).toLowerCase().trim();
          const email = c.email && String(c.email).toLowerCase().trim();
          if (city && email) {
            const key = `${city}|${email}`;
            return !dupSet.has(key);
          }
          // If either city or email is missing, allow insertion (per business rules)
          return true;
        });
      }

      // Bulk insert non-duplicate records for this chunk
      if (chunkToInsert.length > 0) {
        const result = await companyService.bulkInsertCompanies(
          chunkToInsert,
          fileId
        );
        totalInserted += result.inserted || 0;
        totalUpdated += result.updated || 0;
      }

      totalSkippedDuplicates += dupCheck.duplicateCount;
      processedSoFar += chunk.length;

      // Calculate progress percentage from 10% to 95%
      const progressPercent = Math.min(
        95,
        10 + Math.round((processedSoFar / uniqueCompanies.length) * 85)
      );

      await UploadedFile.findByIdAndUpdate(fileId, {
        processedRecords: processedSoFar,
        skippedDuplicates: totalSkippedDuplicates,
        progress: progressPercent,
      });

      console.log(
        `[WORKER] Chunk parsed: ${processedSoFar}/${uniqueCompanies.length} (${progressPercent}%) - Inserted: ${totalInserted}, Updated: ${totalUpdated}`
      );
    }

    // 6. Complete and set status to completed
    await UploadedFile.findByIdAndUpdate(fileId, {
      status: "completed",
      progress: 100,
      processedRecords: processedSoFar,
      skippedDuplicates: totalSkippedDuplicates,
    });

    console.log(`[WORKER] File successfully imported! Total Inserted: ${totalInserted}, Total Updated: ${totalUpdated}, Skipped: ${totalSkippedDuplicates}`);
    parentPort.postMessage({
      success: true,
      inserted: totalInserted,
      updated: totalUpdated,
      skippedDuplicates: totalSkippedDuplicates,
    });
  } catch (error) {
    console.error(`[WORKER ERROR]:`, error);
    try {
      await UploadedFile.findByIdAndUpdate(fileId, {
        status: "failed",
        errorMessage: error.message || "An unexpected error occurred during processing.",
        progress: 100,
      });
    } catch (dbErr) {
      console.error(`[WORKER] Failed to write error status to DB:`, dbErr);
    }
    parentPort.postMessage({ success: false, error: error.message });
  } finally {
    if (dbConnection) {
      await mongoose.connection.close();
      console.log("[WORKER] Database connection closed.");
    }
    process.exit(0);
  }
};

run();
