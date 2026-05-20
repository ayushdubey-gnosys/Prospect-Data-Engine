const Company = require("../models/company.model");

const bulkInsertCompanies = async (companies, fileId) => {
  if (!Array.isArray(companies) || companies.length === 0) return { inserted: 0 };

  const ops = companies.map((c) => {
    const doc = { ...c, fileId };
    
    // Deduplication logic
    let filter = {};
    if (doc.company_name && doc.city) {
      filter = { company_name: doc.company_name, city: doc.city };
    } else {
      // If no unique fields, just use a dummy filter that won't match, causing insert
      filter = { _id: new require('mongoose').Types.ObjectId() };
    }

    return {
      updateOne: {
        filter,
        update: { $set: doc },
        upsert: true
      }
    };
  });

  const result = await Company.bulkWrite(ops, { ordered: false }).catch(err => {
    console.error("MongoDB BulkWrite Error details:", err);
    throw err;
  });

  return { inserted: result.upsertedCount || 0, updated: result.modifiedCount || 0 };
};

const buildFilterQuery = ({ fileId, city, industry, country, search }) => {
  const query = { fileId };

  if (city) query.city = city;
  if (industry) query.industry = industry;
  if (country) query.country = country;

  if (search) {
    const regex = new RegExp(search, "i");
    query.$or = [
      { company_name: regex },
      { email: regex },
      { website: regex },
      { city: regex },
      { country: regex },
    ];
  }

  return query;
};

const getCompaniesByFile = async ({ fileId, page = 1, limit = 25, search, sortBy, sortDir, city, industry, country }) => {
  const query = buildFilterQuery({ fileId, city, industry, country, search });

  const skip = (Math.max(1, page) - 1) * limit;

  const sort = {};
  if (sortBy) sort[sortBy] = sortDir === "desc" ? -1 : 1;
  else sort.createdAt = -1;

  const [data, total] = await Promise.all([
    Company.find(query).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
    Company.countDocuments(query),
  ]);

  return {
    data,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
  };
};

const getDistinctCities = async (fileId) => {
  return Company.distinct("city", { fileId });
};

const getDistinctIndustries = async (fileId, city) => {
  const filter = { fileId };
  if (city) filter.city = city;
  return Company.distinct("industry", filter);
};

const getDistinctCountries = async (fileId) => {
  return Company.distinct("country", { fileId });
};

module.exports = {
  bulkInsertCompanies,
  buildFilterQuery,
  getCompaniesByFile,
  getDistinctCities,
  getDistinctIndustries,
  getDistinctCountries,
};
