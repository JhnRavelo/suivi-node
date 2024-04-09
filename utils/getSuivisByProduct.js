const getProblem = require("./getProblem");

const getSuivisByProduct = async (suivis, users, productId, problems) => {
  const allSuivis = await suivis.findAll({
    where: {
      productId: productId,
    },
    include: [
      { model: users, attribute: ["id", "name"] },
      { model: problems, as: "problems" },
    ],
  });

  if (!allSuivis) return false;
  const filterSuivis = allSuivis.map((item) => {
    const value = item.dataValues;
    const problem = getProblem(value);
    return {
      id: value.id,
      problem: problem,
      solution: value.solution,
      observation: value.observation,
      user: `${value?.user?.name ? value?.user?.name : ""}`,
      createdAt: value.createdAt.split(" ")[0],
    };
  });

  return filterSuivis;
};

module.exports = getSuivisByProduct;
