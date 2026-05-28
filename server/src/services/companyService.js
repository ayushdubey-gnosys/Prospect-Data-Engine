const mongoose = require("mongoose");
const Company = require("../models/company.model");

// ==========================================
// BULK INSERT COMPANIES
// ==========================================

const bulkInsertCompanies = async (
  companies,
  fileId
) => {
  try {
    // ==============================
    // Validate Array
    // ==============================

    if (
      !Array.isArray(companies) ||
      companies.length === 0
    ) {
      return {
        inserted: 0,
        updated: 0,
      };
    }

    // ==============================
    // Remove Invalid Rows
    // company_name required
    // ==============================

    const validCompanies = companies.filter(
      (c) =>
        c &&
        typeof c === "object" &&
        c.company_name &&
        String(c.company_name).trim() !== ""
    );

    if (validCompanies.length === 0) {
      return {
        inserted: 0,
        updated: 0,
      };
    }

    // ==============================
    // Create Bulk Operations
    // ==============================

    const ops = validCompanies.map((c) => {
      // ------------------------------
      // Clean Undefined Values
      // ------------------------------

      const cleanedDoc = {};

      Object.keys(c).forEach((key) => {
        if (
          c[key] !== undefined &&
          c[key] !== null &&
          c[key] !== ""
        ) {
          cleanedDoc[key] = c[key];
        }
      });

      // attach file id
      cleanedDoc.fileId = fileId;

      // ==============================
      // Deduplication Filter
      // ==============================

      let filter = {};

      // duplicate based on
      // company_name + city
      if (
        cleanedDoc.company_name &&
        cleanedDoc.city
      ) {
        filter = {
          company_name: {
            $regex: new RegExp(
              "^" +
                cleanedDoc.company_name
                  .trim()
                  .replace(
                    /[-\/\\^$*+?.()|[\]{}]/g,
                    "\\$&"
                  ) +
                "$",
              "i"
            ),
          },

          city: {
            $regex: new RegExp(
              "^" +
                cleanedDoc.city
                  .trim()
                  .replace(
                    /[-\/\\^$*+?.()|[\]{}]/g,
                    "\\$&"
                  ) +
                "$",
              "i"
            ),
          },
        };
      }

      // duplicate based on
      // company_name + website
      else if (
        cleanedDoc.company_name &&
        cleanedDoc.website
      ) {
        filter = {
          company_name: {
            $regex: new RegExp(
              "^" +
                cleanedDoc.company_name
                  .trim()
                  .replace(
                    /[-\/\\^$*+?.()|[\]{}]/g,
                    "\\$&"
                  ) +
                "$",
              "i"
            ),
          },

          website: {
            $regex: new RegExp(
              "^" +
                cleanedDoc.website
                  .trim()
                  .replace(
                    /[-\/\\^$*+?.()|[\]{}]/g,
                    "\\$&"
                  ) +
                "$",
              "i"
            ),
          },
        };
      }

      // fallback insert
      else {
        filter = {
          _id: new mongoose.Types.ObjectId(),
        };
      }

      return {
        updateOne: {
          filter,

          update: {
            $set: cleanedDoc,
          },

          upsert: true,
        },
      };
    });

    // ==============================
    // Bulk Write
    // ==============================

    const result =
      await Company.bulkWrite(ops, {
        ordered: false,
      });

    // ==============================
    // Return Result
    // ==============================

    return {
      inserted:
        result.upsertedCount || 0,

      updated:
        result.modifiedCount || 0,
    };
  } catch (err) {
    console.error(
      "MongoDB BulkWrite Error:",
      err
    );

    throw err;
  }
};

// ==========================================
// BUILD FILTER QUERY
// ==========================================

const buildFilterQuery = ({
  fileId,
  city,
  industry,
  country,
  search,
  tagId,
}) => {
  const query = { fileId };

  // ==============================
  // Filters
  // ==============================

  if (city) {
    query.city = city;
  }

  if (industry) {
    query.industry = industry;
  }

  if (country) {
    query.country = country;
  }

  if (tagId) {
    query.tags = tagId;
  }

  // ==============================
  // Search
  // ==============================

  if (search) {
    const regex = new RegExp(search, "i");

    query.$or = [
      { company_name: regex },
      { email: regex },
      { website: regex },
      { city: regex },
      { country: regex },
      { phone: regex },
    ];
  }

  return query;
};

// ==========================================
// GET COMPANIES BY FILE
// ==========================================

const getCompaniesByFile = async ({
  fileId,
  page = 1,
  limit = 25,
  search,
  sortBy,
  sortDir,
  city,
  industry,
  country,
  tagId,
}) => {
  const query = buildFilterQuery({
    fileId,
    city,
    industry,
    country,
    search,
    tagId,
  });

  const skip =
    (Math.max(1, page) - 1) *
    parseInt(limit);

  // ==============================
  // Sorting
  // ==============================

  const sort = {};

  if (sortBy) {
    sort[sortBy] =
      sortDir === "desc" ? -1 : 1;
  } else {
    sort.createdAt = -1;
  }

  // ==============================
  // Fetch Data
  // ==============================

  const [data, total] =
    await Promise.all([
      Company.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),

      Company.countDocuments(query),
    ]);

  return {
    data,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
  };
};

// ==========================================
// DISTINCT CITIES
// ==========================================

const getDistinctCities = async (
  fileId,
  { country, industry, tagId } = {}
) => {
  const filter = { fileId };

  if (country) {
    filter.country = country;
  }

  if (industry) {
    filter.industry = industry;
  }

  if (tagId) {
    filter.tags = tagId;
  }

  return Company.distinct(
    "city",
    filter
  );
};

// ==========================================
// DISTINCT INDUSTRIES
// ==========================================

const getDistinctIndustries =
  async (
    fileId,
    { country, city, tagId } = {}
  ) => {
    const filter = { fileId };

    if (country) {
      filter.country = country;
    }

    if (city) {
      filter.city = city;
    }

    if (tagId) {
      filter.tags = tagId;
    }

    return Company.distinct(
      "industry",
      filter
    );
  };

// ==========================================
// DISTINCT COUNTRIES
// ==========================================

const getDistinctCountries =
  async (
    fileId,
    { industry, city, tagId } = {}
  ) => {
    const filter = { fileId };

    if (industry) {
      filter.industry = industry;
    }

    if (city) {
      filter.city = city;
    }

    if (tagId) {
      filter.tags = tagId;
    }

    return Company.distinct(
      "country",
      filter
    );
  };

// ==========================================
// DISTINCT TAGS
// ==========================================

const getDistinctTags =
  async (
    fileId,
    { industry, city, country } = {}
  ) => {
    const filter = { fileId };

    if (industry) {
      filter.industry = industry;
    }

    if (city) {
      filter.city = city;
    }

    if (country) {
      filter.country = country;
    }

    return Company.distinct(
      "tags",
      filter
    );
  };

// ==========================================
// CHECK DUPLICATE DATA
// ==========================================

const checkDuplicateData = async (companies) => {
  if (!Array.isArray(companies) || companies.length === 0) {
    return {
      totalChecked: 0,
      duplicateCount: 0,
      duplicates: [],
    };
  }

  const duplicates = [];

  for (const c of companies) {
    if (!c.company_name || String(c.company_name).trim() === "") {
      continue;
    }

    const companyNameRegex = new RegExp(
      "^" +
        c.company_name
          .trim()
          .replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") +
        "$",
      "i"
    );

    // Build OR conditions for matching
    const orConditions = [];

    // Match by company_name + email
    if (c.email && String(c.email).trim() !== "") {
      orConditions.push({
        company_name: companyNameRegex,
        email: {
          $regex: new RegExp(
            "^" +
              c.email
                .trim()
                .replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") +
              "$",
            "i"
          ),
        },
      });
    }

    // Match by company_name + website
    if (c.website && String(c.website).trim() !== "") {
      orConditions.push({
        company_name: companyNameRegex,
        website: {
          $regex: new RegExp(
            "^" +
              c.website
                .trim()
                .replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") +
              "$",
            "i"
          ),
        },
      });
    }

    // Match by email alone (strong unique identifier)
    if (c.email && String(c.email).trim() !== "") {
      orConditions.push({
        email: {
          $regex: new RegExp(
            "^" +
              c.email
                .trim()
                .replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") +
              "$",
            "i"
          ),
        },
      });
    }

    // Match by website alone (strong unique identifier)
    if (c.website && String(c.website).trim() !== "") {
      orConditions.push({
        website: {
          $regex: new RegExp(
            "^" +
              c.website
                .trim()
                .replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") +
              "$",
            "i"
          ),
        },
      });
    }

    if (orConditions.length === 0) {
      // Fallback: just check company_name
      orConditions.push({
        company_name: companyNameRegex,
      });
    }

    const existing = await Company.findOne({
      $or: orConditions,
    }).lean();

    if (existing) {
      duplicates.push({
        company_name: c.company_name,
        email: c.email || null,
        website: c.website || null,
        matchedWith: {
          company_name: existing.company_name,
          email: existing.email || null,
          website: existing.website || null,
        },
      });
    }
  }

  return {
    totalChecked: companies.filter(
      (c) => c.company_name && String(c.company_name).trim() !== ""
    ).length,
    duplicateCount: duplicates.length,
    duplicates,
  };
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  bulkInsertCompanies,
  checkDuplicateData,
  buildFilterQuery,
  getCompaniesByFile,
  getDistinctCities,
  getDistinctIndustries,
  getDistinctCountries,
  getDistinctTags,
};