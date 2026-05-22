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
      addField("City", c.city || "");
      addField("Country", c.country || "");
      addField("Industry", c.industry || "");
      addField("Phone", c.phone || "");
      addField("Website", c.website || "");
      addField("Social Media", c.socialMedia || "");
      addField("Company Owner", c.companyOwnerName || "");
      addField("Turnover", c.turnover || "");
      addField("Source", c.source || "");
      addField("Tags", c.tags ? c.tags.map(t => t.name).join(", ") : "");
      addField("Employee Contacts", c.contacts && c.contacts.length > 0 
        ? c.contacts.map(con => `${con.name || ""} (${con.position || ""} - ${con.contactNumber || ""}${con.email ? `, ${con.email}` : ""})`).join("; ")
        : "");

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

module.exports = {
  exportCompanies,
  getExportHistory,
};