const Company = require("../../models/company.model");
const UploadedFile = require("../../models/uploadedFile.model");
const Tag = require("../../models/tag.model");
const User = require("../../models/user.model");

const createCompany = async (req, res) => {
  try {
    const companyData = { ...req.body };

    // Auto-create and assign industry tag if industry is present
    if (companyData.industry && companyData.industry.trim()) {
      const trimmed = companyData.industry.trim();
      const esc = trimmed.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      let tag = await Tag.findOne({
        name: { $regex: new RegExp("^" + esc + "$", "i") },
      });
      if (!tag) {
        tag = await Tag.create({ name: trimmed });
      }

      if (!companyData.tags) {
        companyData.tags = [];
      }
      if (!companyData.tags.includes(tag._id)) {
        companyData.tags.push(tag._id);
      }
    }

    const company = await Company.create(companyData);
    
    // Return the company populated with tags
    const populated = await Company.findById(company._id).populate("tags");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getCompanies = async (req, res) => {
  try {
    const filters = {};

    if (req.query.city) {
      filters.city = { $regex: req.query.city, $options: "i" };
    }

    if (req.query.industry) {
      filters.industry = { $regex: req.query.industry, $options: "i" };
    }

    if (req.query.country) {
      filters.country = { $regex: req.query.country, $options: "i" };
    }

    // --- Dynamic Auto Industry Tagging for ALL matching companies ---
    // Scan for companies matching filters that have an industry but NO tags
    const untaggedCompanies = await Company.find({
      ...filters,
      industry: { $nin: [null, ""] },
      $or: [{ tags: { $exists: false } }, { tags: { $size: 0 } }],
    });

    if (untaggedCompanies.length > 0) {
      const industriesToTag = [
        ...new Set(
          untaggedCompanies
            .map((c) => (c.industry && typeof c.industry === "string" ? c.industry.trim() : ""))
            .filter(Boolean)
        ),
      ];
      const tagMap = {};

      for (const ind of industriesToTag) {
        const esc = ind.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        let tag = await Tag.findOne({
          name: { $regex: new RegExp("^" + esc + "$", "i") },
        });
        if (!tag) {
          tag = await Tag.create({ name: ind });
        }
        tagMap[ind.toLowerCase()] = tag._id;
      }

      const bulkOps = untaggedCompanies.map((company) => {
        const tagId = tagMap[company.industry.trim().toLowerCase()];
        return {
          updateOne: {
            filter: { _id: company._id },
            update: { $addToSet: { tags: tagId } },
          },
        };
      });

      if (bulkOps.length > 0) {
        await Company.bulkWrite(bulkOps);
      }
    }
    // ----------------------------------------------------------------

    const total = await Company.countDocuments(filters);

    // Pagination Parameters
    const page = parseInt(req.query.page) || 1;
    const isAll = req.query.limit === 'all';
    const limit = isAll ? total : (parseInt(req.query.limit) || 10);
    const skip = isAll ? 0 : (page - 1) * limit;

    const companies = await Company.find(filters)
      .populate("tags")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(isAll ? 0 : limit);

    res.json({
      companies,
      total,
      page,
      limit: isAll ? 'all' : limit,
      totalPages: isAll ? 1 : Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate("tags");

    res.json(company);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    res.json(company);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteCompany = async (req, res) => {
  try {
    await Company.findByIdAndDelete(req.params.id);

    res.json({
      message: "Company deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const bulkTagCompanies = async (req, res) => {
  try {
    const { companyIds, tagNames, action = "add" } = req.body;

    if (!Array.isArray(companyIds) || !Array.isArray(tagNames)) {
      return res.status(400).json({
        message: "companyIds and tagNames must be arrays",
      });
    }

    const tagIds = [];
    for (const name of tagNames) {
      const trimmedName = name.trim();
      if (!trimmedName) continue;

      // Find tag case-insensitively to avoid duplicates
      let tag = await Tag.findOne({
        name: { $regex: new RegExp("^" + trimmedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") },
      });

      if (!tag) {
        tag = await Tag.create({ name: trimmedName });
      }
      tagIds.push(tag._id);
    }

    if (action === "replace") {
      // Replaces tags with the selected set
      await Company.updateMany(
        { _id: { $in: companyIds } },
        { $set: { tags: tagIds } }
      );
    } else {
      // Default: adds tags to the existing list, avoiding duplicates
      await Company.updateMany(
        { _id: { $in: companyIds } },
        { $addToSet: { tags: { $each: tagIds } } }
      );
    }

    res.json({
      message: "Tags updated successfully",
      tagIds,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [totalCompanies, totalCountries, totalCities, totalIndustries, activeTags, totalImports, totalUsers] = await Promise.all([
      Company.countDocuments(),
      Company.distinct("country").then(countries => countries.filter(Boolean).length),
      Company.distinct("city").then(cities => cities.filter(Boolean).length),
      Company.distinct("industry").then(industries => industries.filter(Boolean).length),
      Tag.countDocuments(),
      UploadedFile.countDocuments(),
      User.countDocuments()
    ]);

    res.json({
      totalCompanies,
      totalCountries,
      totalCities,
      totalIndustries,
      activeTags,
      totalImports,
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboardCharts = async (req, res) => {
  try {
    const [companiesByCountry, companiesByIndustry] = await Promise.all([
      Company.aggregate([
        { $match: { country: { $nin: [null, ""] } } },
        { $group: { _id: "$country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Company.aggregate([
        { $match: { industry: { $nin: [null, ""] } } },
        { $group: { _id: "$industry", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      companiesByCountry: companiesByCountry.map(c => ({ name: c._id, value: c.count })),
      companiesByIndustry: companiesByIndustry.map(i => ({ name: i._id, value: i.count }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCompany,
  getCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
  bulkTagCompanies,
  getDashboardStats,
  getDashboardCharts,
};