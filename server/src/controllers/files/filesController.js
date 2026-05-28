const UploadedFile = require("../../models/uploadedFile.model");
const companyService = require("../../services/companyService");
const exportService = require("../../services/exportService");
const Company = require("../../models/company.model");

const getAllFiles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};
    const { userId } = req.query;

    if (userId) {
      query.uploadedBy = userId;
    } else if (req.user && req.user.role !== "admin" && req.user.role !== "superadmin" && req.user.role !== "marketing") {
      const User = require("../../models/user.model");
      // Ensure the current user always sees their own uploaded files, and also
      // include files uploaded by users in the same role (case-insensitive)
      // plus admin/superadmin accounts.
      const roleUsers = await User.find({
        $or: [
          { role: new RegExp(`^${req.user.role}$`, "i") },
          { role: /admin/i },
          { role: /superadmin/i },
        ],
      }).select("_id");

      const roleUserIds = roleUsers.map((u) => u._id);
      query.$or = [{ uploadedBy: req.user._id }, { uploadedBy: { $in: roleUserIds } }];
    }

    const total = await UploadedFile.countDocuments(query);

    const files = await UploadedFile.find(query)
      .populate("uploadedBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // attach totalRecords count from companies collection for each file
    const filesWithCounts = await Promise.all(
      files.map(async (f) => {
        const totalDocs = await Company.countDocuments({ fileId: f._id });
        return { ...f, totalRecords: totalDocs };
      })
    );

    res.json({
      data: filesWithCounts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

const getFileCompanies = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 25, search, sortBy, sortDir, city, industry, country, tag } = req.query;

    let tagId = null;
    if (tag) {
      const Tag = require("../../models/tag.model");
      const tagDoc = await Tag.findOne({ name: tag });
      if (tagDoc) {
        tagId = tagDoc._id;
      } else {
        return res.json({ data: [], total: 0, page: parseInt(page), limit: parseInt(limit) });
      }
    }

    const result = await companyService.getCompaniesByFile({ fileId: id, page, limit, search, sortBy, sortDir, city, industry, country, tagId });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getFileCities = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { country, industry, tag } = req.query;
    let tagId = null;
    if (tag) {
      const Tag = require("../../models/tag.model");
      const tagDoc = await Tag.findOne({ name: tag });
      tagId = tagDoc ? tagDoc._id : "000000000000000000000000";
    }
    const cities = await companyService.getDistinctCities(id, { country, industry, tagId });
    res.json({ data: cities.filter(Boolean).sort() });
  } catch (error) {
    next(error);
  }
};

const getFileIndustries = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { country, city, tag } = req.query;
    let tagId = null;
    if (tag) {
      const Tag = require("../../models/tag.model");
      const tagDoc = await Tag.findOne({ name: tag });
      tagId = tagDoc ? tagDoc._id : "000000000000000000000000";
    }
    const industries = await companyService.getDistinctIndustries(id, { country, city, tagId });
    res.json({ data: industries.filter(Boolean).sort() });
  } catch (error) {
    next(error);
  }
};

const getFileCountries = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { industry, city, tag } = req.query;
    let tagId = null;
    if (tag) {
      const Tag = require("../../models/tag.model");
      const tagDoc = await Tag.findOne({ name: tag });
      tagId = tagDoc ? tagDoc._id : "000000000000000000000000";
    }
    const countries = await companyService.getDistinctCountries(id, { industry, city, tagId });
    res.json({ data: countries.filter(Boolean).sort() });
  } catch (error) {
    next(error);
  }
};

const getFileTags = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { industry, city, country } = req.query;
    const tagIds = await companyService.getDistinctTags(id, { industry, city, country });
    const Tag = require("../../models/tag.model");
    const tags = await Tag.find({ _id: { $in: tagIds } });
    res.json({ data: tags.map(t => ({ _id: t._id, name: t.name })).sort((a, b) => a.name.localeCompare(b.name)) });
  } catch (error) {
    next(error);
  }
};

const filterAndExport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { city, industry, country, search, format = "csv", columns, tag } = req.query;

    let tagId = null;
    if (tag) {
      const Tag = require("../../models/tag.model");
      const tagDoc = await Tag.findOne({ name: tag });
      if (tagDoc) {
        tagId = tagDoc._id;
      } else {
        tagId = "000000000000000000000000"; // non existent objectid
      }
    }

    const query = companyService.buildFilterQuery({ fileId: id, city, industry, country, search, tagId });
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
  getFileTags,
  filterAndExport,
};
