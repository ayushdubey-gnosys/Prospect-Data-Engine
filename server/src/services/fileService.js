const fs = require("fs");
const path = require("path");

const csv = require("csv-parser");
const xlsx = require("xlsx");

const UploadedFile = require("../models/uploadedFile.model");

// =======================================
// Parse CSV
// =======================================

const parseCSV = (filePath) =>
  new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => rows.push(data))
      .on("end", () => resolve(rows))
      .on("error", (err) => reject(err));
  });

// =======================================
// Parse Excel
// =======================================

const parseExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  let allData = [];

  console.log(`[PARSE] Excel file has ${workbook.SheetNames.length} sheet(s): ${workbook.SheetNames.join(", ")}`);

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const data = xlsx.utils.sheet_to_json(sheet, {
      defval: "",
      raw: false, // convert everything to strings for consistent mapping
    });

    console.log(`[PARSE] Sheet "${sheetName}": ${data.length} rows found`);

    if (data.length > 0) {
      allData = allData.concat(data);
    }
  }

  console.log(`[PARSE] Total rows from all sheets: ${allData.length}`);
  return allData;
};

// =======================================
// Parse File
// =======================================

const parseFile = async (
  filePath,
  mimetype
) => {
  const ext = path
    .extname(filePath)
    .toLowerCase();

  if (
    ext === ".csv" ||
    mimetype === "text/csv"
  ) {
    return parseCSV(filePath);
  }

  return parseExcel(filePath);
};

// =======================================
// Save Upload History
// =======================================

const saveUploadedFile = async ({
  fileName,
  originalName,
  sourceType,
  totalRecords,
  uploadedBy,
  uploadPath,
}) => {
  return UploadedFile.create({
    fileName,
    originalName,
    sourceType,
    totalRecords,
    uploadedBy,
    uploadPath,
  });
};

module.exports = {
  parseFile,
  saveUploadedFile,
};