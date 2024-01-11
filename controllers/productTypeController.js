const { productTypes } = require("../database/models");

const getAllProductTypes = async (req, res) => {
  const allProductTypes = await productTypes.findAll();

  if (!allProductTypes) return res.json({ success: false });

  res.json({ success: true, productTypes: allProductTypes });
};

module.exports = { getAllProductTypes };