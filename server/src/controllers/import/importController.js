const importModel  = require("../../models/import.model");
const UploadedFile = require("../../models/uploadedFile.model");
const importCSV = async (req, res) => {
  try {
    const {
      source_type,
      file_name,
      total_records,
      imported_records,
      duplicates_skipped,
    } = req.body;

    const newImport = await importModel.create({
      source_type,
      file_name,
      total_records,
      imported_records,
      duplicates_skipped,
    });

    res.status(201).json({
      message: "CSV Imported Successfully",
      data: newImport,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getHistory = async (req, res) => {
  try {
    const history = await UploadedFile.find()
      .populate("uploadedBy", "name email role")
      .sort({ uploadedAt: -1 })
      .limit(50);
    res.status(200).json({ history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  importCSV,
  getHistory,
};