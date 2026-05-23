const Company = require("../../models/company.model");

const getCountries = async (req, res, next) => {
  try {
    const { industry, city } = req.query;
    const filter = {};
    if (industry) filter.industry = industry;
    if (city) filter.city = city;

    const countries = await Company.distinct("country", filter);
    res.json({ data: countries.filter(Boolean).sort() });
  } catch (error) {
    next(error);
  }
};

const getCities = async (req, res, next) => {
  try {
    const { country, industry } = req.query;
    const filter = {};
    if (country) filter.country = country;
    if (industry) filter.industry = industry;
    
    const cities = await Company.distinct("city", filter);
    res.json({ data: cities.filter(Boolean).sort() });
  } catch (error) {
    next(error);
  }
};

const getIndustries = async (req, res, next) => {
  try {
    const { country, city } = req.query;
    const filter = {};
    if (country) filter.country = country;
    if (city) filter.city = city;

    const industries = await Company.distinct("industry", filter);
    res.json({ data: industries.filter(Boolean).sort() });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCountries,
  getCities,
  getIndustries,
};

