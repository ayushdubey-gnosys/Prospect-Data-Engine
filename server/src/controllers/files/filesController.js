const UploadedFile = require("../../models/uploadedFile.model");
const companyService = require("../../services/companyService");
const exportService = require("../../services/exportService");
const Company = require("../../models/company.model");

const getAllFiles = async (req, res, next) => {
  try {
    const files = await UploadedFile.find().sort({ createdAt: -1 }).lean();

    // attach totalRecords count from companies collection for each file
    const filesWithCounts = await Promise.all(
      files.map(async (f) => {
        const total = await Company.countDocuments({ fileId: f._id });
        return { ...f, totalRecords: total };
      })
    );

    res.json({ data: filesWithCounts });
  } catch (error) {
    next(error);
  }
};

const getFileCompanies = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 25, search, sortBy, sortDir, city, industry, country } = req.query;

    const result = await companyService.getCompaniesByFile({ fileId: id, page, limit, search, sortBy, sortDir, city, industry, country });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getFileCities = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cities = await companyService.getDistinctCities(id);
    res.json({ data: cities.filter(Boolean).sort() });
  } catch (error) {
    next(error);
  }
};

const getFileIndustries = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { city } = req.query;
    const industries = await companyService.getDistinctIndustries(id, city);
    res.json({ data: industries.filter(Boolean).sort() });
  } catch (error) {
    next(error);
  }
};

const getFileCountries = async (req, res, next) => {
  try {
    const { id } = req.params;
    const countries = await companyService.getDistinctCountries(id);
    res.json({ data: countries.filter(Boolean).sort() });
  } catch (error) {
    next(error);
  }
};

const filterAndExport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { city, industry, country, search, format = "csv", columns } = req.query;

    const query = companyService.buildFilterQuery({ fileId: id, city, industry, country, search });
    const companies = await Company.find(query).populate("tags").lean();

    let selectedColumns = null;
    if (columns) {
      selectedColumns = columns.split(",");
    }

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

    if (format === "xlsx" || format === "excel") {
      const outPath = exportService.exportToExcel(rows, `export_${id}_${Date.now()}.xlsx`);
      return res.download(outPath);
    }

    const outPath = exportService.exportToCSV(rows, `export_${id}_${Date.now()}.csv`);
    return res.download(outPath);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllFiles,
  getFileCompanies,
  getFileCities,
  getFileIndustries,
  getFileCountries,
  filterAndExport,
};
