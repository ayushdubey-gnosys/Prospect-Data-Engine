const Company = require("../../models/company.model");
const exportService = require("../../services/exportService");

const exportCompanies = async (req, res) => {
  try {
    const filters = {};

    if (req.query.city) {
      filters.city = { $regex: req.query.city, $options: "i" };
    }

    if (req.query.state) {
      filters.state = { $regex: req.query.state, $options: "i" };
    }

    if (req.query.industry) {
      filters.industry = { $regex: req.query.industry, $options: "i" };
    }

    if (req.query.country) {
      filters.country = { $regex: req.query.country, $options: "i" };
    }

    if (req.query.tag) {
      const Tag = require("../../models/tag.model");
      const tagDoc = await Tag.findOne({ name: req.query.tag });
      if (tagDoc) {
        filters.tags = tagDoc._id;
      } else {
        filters.tags = null;
      }
    }


    // Fetch all companies matching filters (excluding tags for simplicity or map them)
    const companies = await Company.find(filters).populate("tags").lean();

    let selectedColumns = null;
    if (req.query.columns) {
      selectedColumns = req.query.columns.split(",");
    }

    // Map companies to a flat structure for Excel/CSV
    const rows = companies.map(c => {
      const row = {};
      const addField = (colName, value) => {
        if (!selectedColumns || selectedColumns.includes(colName)) {
          row[colName] = value;
        }
      };

      addField("Company Name", c.company_name || "");
      addField("Website", c.website || "");
      addField("Email", c.email || "");
      addField("Phone", c.phone || "");
      addField("City", c.city || "");
      addField("Country", c.country || "");
      addField("Industry", c.industry || "");
      addField("Tags", c.tags ? c.tags.map(t => t.name).join(", ") : "");
      addField("Description", c.description || "");
      addField("Source", c.source || "");

      return row;
    });

    const format = req.query.format || "xlsx";
    const fileName = `companies_export_${Date.now()}.${format}`;
    let outPath;
    
    if (format === "csv") {
      outPath = exportService.exportToCSV(rows, fileName);
    } else {
      outPath = exportService.exportToExcel(rows, fileName);
    }
    
    // Create export history
    const ExportHistory = require("../../models/exportHistory.model");
    await ExportHistory.create({
      fileName,
      filters: req.query || {},
      totalRecords: companies.length,
      exportedBy: req.user ? req.user._id : null,
    });

    res.download(outPath);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getExportHistory = async (req, res) => {
  try {
    const ExportHistory = require("../../models/exportHistory.model");
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    const { userId } = req.query;

    if (userId) {
      query.exportedBy = userId;
    } else if (req.user && req.user.role !== "admin" && req.user.role !== "superadmin") {
      const User = require("../../models/user.model");
      const roleUsers = await User.find({ role: { $in: [req.user.role, "admin", "superadmin"] } }).select("_id");
      query.exportedBy = { $in: roleUsers.map((u) => u._id) };
    }

    const total = await ExportHistory.countDocuments(query);
    const history = await ExportHistory.find(query)
      .populate("exportedBy", "name email role")
      .sort({ exportedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.status(200).json({ 
      history,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ─── Regenerate Export ───────────────────────────────────────────────────────

const regenerateExport = async (req, res) => {
  try {
    const { exportId } = req.params;
    const { ignoredColumns = [] } = req.body;

    const ExportHistory = require("../../models/exportHistory.model");
    const RegenerateHistory = require("../../models/regenerateHistory.model");
    
    const original = await ExportHistory.findById(exportId);
    if (!original) {
      return res.status(404).json({ success: false, message: 'Export record not found.' });
    }

    const ignored = Array.isArray(ignoredColumns)
      ? ignoredColumns
      : ignoredColumns ? ignoredColumns.split(',') : [];

    const savedFilters = original.filters || {};
    const query = {};

    if (savedFilters.city) {
      query.city = { $regex: savedFilters.city, $options: "i" };
    }
    if (savedFilters.state) {
      query.state = { $regex: savedFilters.state, $options: "i" };
    }
    if (savedFilters.industry) {
      query.industry = { $regex: savedFilters.industry, $options: "i" };
    }
    if (savedFilters.country) {
      query.country = { $regex: savedFilters.country, $options: "i" };
    }
    if (savedFilters.tag) {
      const Tag = require("../../models/tag.model");
      const tagDoc = await Tag.findOne({ name: savedFilters.tag });
      if (tagDoc) {
        query.tags = tagDoc._id;
      } else {
        query.tags = null;
      }
    }

    const companies = await Company.find(query).populate("tags").lean();

    if (!companies.length) {
      return res.status(404).json({ success: false, message: 'No records found for the original filters.' });
    }

    let selectedColumns = null;
    if (savedFilters.columns) {
      selectedColumns = savedFilters.columns.split(",");
    }

    // Map companies to a flat structure for Excel/CSV
    const rows = companies.map(c => {
      const row = {};
      const addField = (colName, value) => {
        if ((!selectedColumns || selectedColumns.includes(colName)) && !ignored.includes(colName)) {
          row[colName] = value;
        }
      };

      addField("Company Name", c.company_name || "");
      addField("Website", c.website || "");
      addField("Email", c.email || "");
      addField("Phone", c.phone || "");
      addField("City", c.city || "");
      addField("Country", c.country || "");
      addField("Industry", c.industry || "");
      addField("Tags", c.tags ? c.tags.map(t => t.name).join(", ") : "");
      addField("Description", c.description || "");
      addField("Source", c.source || "");

      return row;
    });

    const format = original.fileName?.endsWith('.csv') ? 'csv' : 'xlsx';
    const timestamp = Date.now();
    const fileName = `regen_${exportId}_${timestamp}.${format}`;
    
    let filePath;
    if (format === "csv") {
      filePath = exportService.exportToCSV(rows, fileName);
    } else {
      filePath = exportService.exportToExcel(rows, fileName);
    }

    // Save regeneration history
    await RegenerateHistory.create({
      originalExport: exportId,
      filters:        original.filters,
      ignoredColumns: ignored,
      regeneratedBy:  req.user ? req.user._id : null,
      totalRecords:   companies.length,
      fileName,
      filePath,
    });

    // Increment counter on original
    await ExportHistory.findByIdAndUpdate(exportId, { $inc: { regenerateCount: 1 } });

    res.download(filePath, fileName);
  } catch (err) {
    console.error('regenerateExport error:', err);
    res.status(500).json({ success: false, message: 'Regeneration failed', error: err.message });
  }
};

// ─── Get Regeneration History ────────────────────────────────────────────────

const getRegenerateHistory = async (req, res) => {
  try {
    const { exportId } = req.params;

    const ExportHistory = require("../../models/exportHistory.model");
    const RegenerateHistory = require("../../models/regenerateHistory.model");

    const original = await ExportHistory.findById(exportId)
      .populate('exportedBy', 'name email role')
      .lean();

    if (!original) {
      return res.status(404).json({ success: false, message: 'Export record not found.' });
    }

    const regenerations = await RegenerateHistory.find({ originalExport: exportId })
      .populate('regeneratedBy', 'name email role')
      .sort({ regeneratedAt: -1 })
      .lean();

    res.json({
      success: true,
      originalExport:      original,
      totalRegenerations:  regenerations.length,
      regenerations,
    });
  } catch (err) {
    console.error('getRegenerateHistory error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch regeneration history', error: err.message });
  }
};

module.exports = {
  exportCompanies,
  getExportHistory,
  regenerateExport,
  getRegenerateHistory,
};