const sequelize = require("sequelize")
const {suivis, products} = require("../database/models")

module.exports = async () => {
  const suiviByProduct = await suivis.findAll({
    attributes: [
      [sequelize.literal("YEAR(suivis.createdAt)"), "year"],
      [sequelize.literal("MONTH(suivis.createdAt)"), "month"],
      [sequelize.fn("COUNT", sequelize.col("productId")), "count"],
      "productId",
    ],
    include: [
      {
        model: products,
      },
    ],
    group: ["productId", "year", "month"],
  });
  return suiviByProduct;
};
