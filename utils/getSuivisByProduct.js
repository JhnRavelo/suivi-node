const getProblem = require("./getProblem");
const getSuivisByProductPerMonth = require("./getSuivisByProductPerMonth");
const sequelize = require("sequelize");

const getSuivisByProduct = async (suivis, users, productId, problems) => {
  const allSuivis = await suivis.findAll({
    where: {
      productId: productId,
    },
    include: [
      { model: users, attribute: ["id", "name"] },
      { model: problems, as: "problems" },
    ],
    order: [["createdAt", "DESC"]],
  });

  if (!allSuivis) return { success: false };
  const filterSuivis = allSuivis.map((item) => {
    const value = item.dataValues;
    const problem = getProblem(value);
    return {
      id: value.id,
      problem: problem,
      solution: value.solution,
      observation: value.observation,
      user: `${value?.user?.name ? value?.user?.name : ""}`,
      createdAt: `${value.createdAt.split(" ")[0]}\n${
        value.createdAt.split(" ")[1]
      }`,
    };
  });

  const suivisByProduct = await getSuivisByProductPerMonth();
  const filterSuivisByProduct = suivisByProduct.filter(
    (item) => item.productId == productId
  );

  const uniqueYears = new Set();
  filterSuivisByProduct.forEach((item) => {
    uniqueYears.add(item.dataValues.year);
  });
  const years = Array.from(uniqueYears);

  const statProblems = await suivis.findAll({
    where: { productId },
    attributes: [
      [sequelize.literal("YEAR(suivis.createdAt)"), "year"],
      [sequelize.fn("COUNT", sequelize.col("problemId")), "count"],
      "problemId",
    ],
    include: [{ model: problems, as: "problems", attributes: ["name"] }],
    group: ["year", "problemId"],
    order: [[sequelize.literal("count"), "DESC"]],
  });

  return {
    allSuivis: filterSuivis,
    years,
    statProducts: filterSuivisByProduct,
    success: true,
    statProblems,
  };
};

module.exports = getSuivisByProduct;
