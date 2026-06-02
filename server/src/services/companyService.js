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
    // Process in Chunks
    // ==============================

    const CHUNK_SIZE = 1000;
    let totalInserted = 0;
    let totalUpdated = 0;

    for (let i = 0; i < validCompanies.length; i += CHUNK_SIZE) {
      const chunk = validCompanies.slice(i, i + CHUNK_SIZE);

      const ops = chunk.map((c) => {
        // Clean Undefined Values
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

        // For import we will not upsert by company_name (company_name is not unique).
        // Instead, bulk insertion will be handled after duplicates (city+email) are filtered
        // by the worker. Here we prepare cleaned documents for insertion.
        return cleanedDoc;
      });
      // Insert chunk documents directly
      if (ops.length > 0) {
        try {
          const insertResult = await Company.insertMany(ops, { ordered: false });
          totalInserted += insertResult.length || 0;
        } catch (err) {
          // insertMany may throw for some duplicates or constraints; log and continue
          console.error('insertMany error (continuing):', err.message || err);
          if (err.result && err.result.nInserted) {
            totalInserted += err.result.nInserted;
          }
        }
      }
    }

    return {
      inserted: totalInserted,
      updated: totalUpdated,
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
        .populate("tags")
        .populate("leadStatus.updatedBy", "name email")
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

  const validCompanies = companies.filter(
    (c) => c.company_name && String(c.company_name).trim() !== ""
  );

  if (validCompanies.length === 0) {
    return {
      totalChecked: 0,
      duplicateCount: 0,
      duplicates: [],
    };
  }

  // ==============================
  // Batch duplicate check using $or
  // Process in chunks to avoid too-large queries
  // ==============================

  const CHUNK_SIZE = 5000;
  const duplicates = [];

  for (let i = 0; i < validCompanies.length; i += CHUNK_SIZE) {
    const chunk = validCompanies.slice(i, i + CHUNK_SIZE);

    // Collect all duplicateKeys from this chunk
    const duplicateKeys = [];

    for (const c of chunk) {
      const city = c.city && String(c.city).trim().toLowerCase();
      const email = c.email && String(c.email).trim().toLowerCase();
      if (city && email) {
        duplicateKeys.push(city + "|" + email);
      }
    }

    if (duplicateKeys.length === 0) continue;

    // Use $in query to find existing duplicates fast using the duplicateKey index
    const existingRecords = await Company.find(
      { duplicateKey: { $in: duplicateKeys } }, 
      { duplicateKey: 1, company_name: 1, city: 1, email: 1 }
    ).lean();

    const existingPairSet = new Set(
      existingRecords
        .filter((r) => r.duplicateKey)
        .map((r) => r.duplicateKey)
    );

    for (const c of chunk) {
      const city = c.city && String(c.city).toLowerCase().trim();
      const email = c.email && String(c.email).toLowerCase().trim();
      if (city && email) {
        const key = `${city}|${email}`;
        if (existingPairSet.has(key)) {
          duplicates.push({ company_name: c.company_name, city: c.city, email: c.email });
        }
      }
    }
  }

  return {
    totalChecked: validCompanies.length,
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