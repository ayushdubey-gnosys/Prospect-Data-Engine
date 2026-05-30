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

        // Deduplication Filter
        let filter = {};

        if (cleanedDoc.company_name && cleanedDoc.city) {
          filter = {
            company_name: {
              $regex: new RegExp(
                "^" +
                  cleanedDoc.company_name
                    .trim()
                    .replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") +
                  "$",
                "i"
              ),
            },
            city: {
              $regex: new RegExp(
                "^" +
                  cleanedDoc.city
                    .trim()
                    .replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") +
                  "$",
                "i"
              ),
            },
          };
        } else if (cleanedDoc.company_name && cleanedDoc.website) {
          filter = {
            company_name: {
              $regex: new RegExp(
                "^" +
                  cleanedDoc.company_name
                    .trim()
                    .replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") +
                  "$",
                "i"
              ),
            },
            website: {
              $regex: new RegExp(
                "^" +
                  cleanedDoc.website
                    .trim()
                    .replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") +
                  "$",
                "i"
              ),
            },
          };
        } else {
          filter = {
            _id: new mongoose.Types.ObjectId(),
          };
        }

        return {
          updateOne: {
            filter,
            update: { $set: cleanedDoc },
            upsert: true,
          },
        };
      });

      const result = await Company.bulkWrite(ops, {
        ordered: false,
      });

      totalInserted += result.upsertedCount || 0;
      totalUpdated += result.modifiedCount || 0;
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

  const CHUNK_SIZE = 500;
  const duplicates = [];

  for (let i = 0; i < validCompanies.length; i += CHUNK_SIZE) {
    const chunk = validCompanies.slice(i, i + CHUNK_SIZE);

    // Collect all unique company names, emails, and websites from this chunk
    const companyNames = [];
    const emails = [];
    const websites = [];

    for (const c of chunk) {
      if (c.company_name) companyNames.push(c.company_name.trim().toLowerCase());
      if (c.email && String(c.email).trim()) emails.push(c.email.trim().toLowerCase());
      if (c.website && String(c.website).trim()) websites.push(c.website.trim().toLowerCase());
    }

    // Build a single query to find any existing records matching names/emails/websites
    const orConditions = [];

    if (companyNames.length > 0) {
      orConditions.push({
        company_name: {
          $in: companyNames.map(
            (n) => new RegExp("^" + n.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "$", "i")
          ),
        },
      });
    }

    if (emails.length > 0) {
      orConditions.push({
        email: {
          $in: emails.map(
            (e) => new RegExp("^" + e.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "$", "i")
          ),
        },
      });
    }

    if (websites.length > 0) {
      orConditions.push({
        website: {
          $in: websites.map(
            (w) => new RegExp("^" + w.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "$", "i")
          ),
        },
      });
    }

    if (orConditions.length === 0) continue;

    // Single batch query for this chunk
    const existingRecords = await Company.find(
      { $or: orConditions },
      { company_name: 1, email: 1, website: 1 }
    ).lean();

    // Build lookup sets from existing records for fast matching
    const existingNameSet = new Set(
      existingRecords.map((r) => (r.company_name || "").toLowerCase().trim())
    );
    const existingEmailSet = new Set(
      existingRecords.filter((r) => r.email).map((r) => r.email.toLowerCase().trim())
    );
    const existingWebsiteSet = new Set(
      existingRecords.filter((r) => r.website).map((r) => r.website.toLowerCase().trim())
    );

    // Check each company in this chunk against existing records
    for (const c of chunk) {
      const name = (c.company_name || "").toLowerCase().trim();
      const email = (c.email || "").toLowerCase().trim();
      const website = (c.website || "").toLowerCase().trim();

      let isDuplicate = false;

      // Match by company_name + email
      if (name && email && existingNameSet.has(name) && existingEmailSet.has(email)) {
        isDuplicate = true;
      }
      // Match by company_name + website
      else if (name && website && existingNameSet.has(name) && existingWebsiteSet.has(website)) {
        isDuplicate = true;
      }
      // Match by email alone
      else if (email && existingEmailSet.has(email)) {
        isDuplicate = true;
      }
      // Match by website alone
      else if (website && existingWebsiteSet.has(website)) {
        isDuplicate = true;
      }

      if (isDuplicate) {
        duplicates.push({
          company_name: c.company_name,
          email: c.email || null,
          website: c.website || null,
        });
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