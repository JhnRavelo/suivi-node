const getProducts = async (products, productTypes, users, res) => {
  const allProducts = await products.findAll({
    include: [{ model: productTypes }, { model: users }],
  });

  if (!allProducts) return res.json({ success: false });
  const filterProducts = allProducts.map((item) => {
    let value = item.dataValues;
    return {
      id: value.id,
      type: value.productType.name,
      dimension: value.dimension,
      devis: value.devis,
      client: value.client,
      chantier: value.chantier,
      detail: value.detail,
      location: value.location,
      createdAt: value.createdAt,
      tech: value?.user?.name,
    };
  });

  return filterProducts;
};

module.exports = getProducts;
