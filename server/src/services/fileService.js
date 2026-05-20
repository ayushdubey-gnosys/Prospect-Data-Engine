const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const xlsx = require("xlsx");
const UploadedFile = require("../models/uploadedFile.model");

const parseCSV = (filePath) =>
  new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => rows.push(data))
      .on("end", () => resolve(rows))
      .on("error", (err) => reject(err));
  });

const parseExcel = (filePath) => {
  const wb = xlsx.readFile(filePath);
  const firstSheet = wb.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(wb.Sheets[firstSheet], { defval: null });
  return data;
};

const parseFile = async (filePath, mimetype) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".csv" || mimetype === "text/csv" || ext === ".gsheet") {
    return parseCSV(filePath);
  }

  // treat xlsx/xls
  return parseExcel(filePath);
};

const saveUploadedFile = async ({ fileName, originalName, sourceType, totalRecords, uploadedBy, uploadPath }) => {
  const doc = await UploadedFile.create({ fileName, originalName, sourceType, totalRecords, uploadedBy, uploadPath });
  return doc;
};

module.exports = {
  parseFile,
  saveUploadedFile,
};
