const { products } = require("../database/models");

const addProduct = async (req, res) => {
  const { type, location, devis, detail, dimension } = await req.body;

  if (!type || !location || !devis || !dimension)
    return res.json({ success: false });

  const productAdded = await products.create({
    productTypeId: type,
    location,
    detail,
    devis,
    dimension,
  });

  if (!productAdded) return res.json({ success: false });

  res.json({ success: true, product: productAdded.id });
};

module.exports = { addProduct };
