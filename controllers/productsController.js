const { products } = require("../database/models");

const addProduct = async (req, res) => {
  const { type, location, devis, detail, dimension, client, chantier } = await req.body;

  const id = req.user;

  if (!type || !location || !devis || !dimension)
    return res.json({ success: false });

  const productAdded = await products.create({
    productTypeId: type,
    location,
    detail,
    devis,
    dimension,
    userProductId: id,
    client,
    chantier
  });

  if (!productAdded) return res.json({ success: false });

  res.json({ success: true, product: productAdded.id });
};

module.exports = { addProduct };
