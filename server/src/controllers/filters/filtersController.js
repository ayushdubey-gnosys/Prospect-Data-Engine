const Company = require("../../models/company.model");

const getCountries = async (req, res, next) => {
  try {
    const countries = await Company.distinct("country");
    res.json({ data: countries.filter(Boolean).sort() });
  } catch (error) {
    next(error);
  }
};

const getCities = async (req, res, next) => {
  try {
    const { country } = req.query;
    const filter = {};
    if (country) filter.country = country;
    
    const cities = await Company.distinct("city", filter);
    res.json({ data: cities.filter(Boolean).sort() });
  } catch (error) {
    next(error);
  }
};

const getIndustries = async (req, res, next) => {
  try {
    const industries = await Company.distinct("industry");
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
