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

    // Map companies to a flat structure for Excel
    const rows = companies.map(c => ({
      "Company Name": c.company_name || "",
      "City": c.city || "",
      "Country": c.country || "",
      "Industry": c.industry || "",
      "Phone": c.phone || "",
      "Website": c.website || "",
      "Social Media": c.socialMedia || "",
      "Company Owner": c.companyOwnerName || "",
      "Turnover": c.turnover || "",
      "Source": c.source || "",
      "Tags": c.tags ? c.tags.map(t => t.name).join(", ") : "",
      "Employee Contacts": c.contacts && c.contacts.length > 0 
        ? c.contacts.map(con => `${con.name || ""} (${con.position || ""} - ${con.contactNumber || ""}${con.email ? `, ${con.email}` : ""})`).join("; ")
        : "",
    }));

    const fileName = `companies_export_${Date.now()}.xlsx`;
    const outPath = exportService.exportToExcel(rows, fileName);
    
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
    const history = await ExportHistory.find()
      .populate("exportedBy", "name email role")
      .sort({ exportedAt: -1 })
      .limit(50);
    
    res.status(200).json({ history });
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