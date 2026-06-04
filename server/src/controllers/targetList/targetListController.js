const TargetList = require("../../models/targetList.model");
const Company = require("../../models/company.model");
const Tag = require("../../models/tag.model");

// Helper to build filter query, similar to company.controller.js getCompanies
const buildFilterQuery = async (queryObj) => {
  const filters = {};

  if (queryObj.search) {
    filters.company_name = { $regex: queryObj.search, $options: "i" };
  }
  if (queryObj.city) {
    filters.city = { $regex: queryObj.city, $options: "i" };
  }
  if (queryObj.industry) {
    filters.industry = { $regex: queryObj.industry, $options: "i" };
  }
  if (queryObj.country) {
    filters.country = { $regex: queryObj.country, $options: "i" };
  }
  if (queryObj.tag) {
    const tagDoc = await Tag.findOne({ name: queryObj.tag });
    if (tagDoc) {
      filters.tags = tagDoc._id;
    } else {
      // If tag not found, force no results
      filters.tags = "000000000000000000000000"; 
    }
  }

  return filters;
};

const createTargetList = async (req, res, next) => {
  try {
    const { name, filters } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Target list name is required." });
    }

    // Build the query to find companies
    const query = await buildFilterQuery(filters || {});
    
    // Get all matching companies (just their IDs)
    const companies = await Company.find(query).select("_id").lean();
    const companyIds = companies.map(c => c._id);

    const targetList = await TargetList.create({
      name,
      filters: filters || {},
      companies: companyIds,
      createdBy: req.user._id,
    });

    res.status(201).json(targetList);
  } catch (error) {
    next(error);
  }
};

const getTargetLists = async (req, res, next) => {
  try {
    const targetLists = await TargetList.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res.json(targetLists);
  } catch (error) {
    next(error);
  }
};

const getTargetListById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const targetList = await TargetList.findById(id)
      .populate("createdBy", "name email")
      .lean();

    if (!targetList) {
      return res.status(404).json({ message: "Target list not found." });
    }

    const skip = (Math.max(1, page) - 1) * parseInt(limit);
    const total = targetList.companies.length;

    // Fetch the companies with pagination
    const companies = await Company.find({ _id: { $in: targetList.companies } })
      .populate("tags")
      .populate("leadStatus.updatedBy", "name email")
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      targetList,
      companies: {
        data: companies,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      }
    });
  } catch (error) {
    next(error);
  }
};

const repopulateTargetList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const targetList = await TargetList.findById(id);

    if (!targetList) {
      return res.status(404).json({ message: "Target list not found." });
    }

    // Build query using saved filters
    const query = await buildFilterQuery(targetList.filters || {});
    
    // Find all matching company IDs
    const matchingCompanies = await Company.find(query).select("_id").lean();
    const matchingIds = matchingCompanies.map(c => c._id.toString());

    // Current IDs
    const currentIdsSet = new Set(targetList.companies.map(id => id.toString()));

    // Find new IDs
    const newIds = matchingIds.filter(id => !currentIdsSet.has(id));

    if (newIds.length > 0) {
      targetList.companies.push(...newIds);
      await targetList.save();
    }

    res.json({ 
      message: `Repopulated successfully. Added ${newIds.length} new companies.`,
      addedCount: newIds.length,
      totalCount: targetList.companies.length
    });
  } catch (error) {
    next(error);
  }
};

const deleteTargetList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const targetList = await TargetList.findByIdAndDelete(id);

    if (!targetList) {
      return res.status(404).json({ message: "Target list not found." });
    }

    res.json({ message: "Target list deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTargetList,
  getTargetLists,
  getTargetListById,
  repopulateTargetList,
  deleteTargetList,
};
