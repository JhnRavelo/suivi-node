const getProblem = require("./getProblem");

const getSuivis = async (
  suivis,
  users,
  products,
  productTypes,
  res,
  problems
) => {
  const allSuivis = await suivis.findAll({
    include: [
      { model: users },
      { model: products, include: [{ model: productTypes }] },
      { model: problems, as: "problems" },
    ],
  });

  if (!allSuivis) return res.json({ success: false });

  const filterSuivis = allSuivis.map((item) => {
    const value = item.dataValues;
    const problem = getProblem(value);
    return {
      tech: value.user.name,
      id: value.id,
      type: value.product.productType.name,
      problem: problem,
      solution: value.solution,
      observation: value.observation,
      chantier: value.product.chantier,
      client: value.product.client,
      devis: value.product.devis,
      createdAt: value.createdAt,
    };
  });
  return filterSuivis;
};

module.exports = getSuivis;
