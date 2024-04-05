const getSuivis = async (
  suivis,
  products,
  productTypes,
  res,
) => {
  const allSuivis = await suivis.findAll({
    include: [
      { model: products, include: [{ model: productTypes }] },
    ],
  });

  if (!allSuivis) return false;

  const filterSuivis = allSuivis.map((item) => {
    const value = item.dataValues;
    return {
      id: value.id,
      problem: value.problem,
      solution: value.solution,
      observation: value.observation,
      createdAt: value.createdAt,
      userId: value.userId,
      problemId: value.problemId,
      productTypeId: value.product.productType.id,
      productId: value.productId
    };
  });
  return filterSuivis;
};

module.exports = getSuivis;
