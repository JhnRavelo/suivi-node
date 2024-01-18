const { Op } = require("sequelize");
const { users, suivis, products, productTypes } = require("../database/models");

const getByProduct = async (req, res) => {
  const { email, id } = await req.body;

  if (!email || !id) return res.json({ success: false });

  const isEmail = await users.findOne({
    where: {
      email: {
        [Op.eq]: email,
      },
    },
  });

  if (!isEmail) return res.json({ success: false });

  const allSuivi = await suivis.findAll({
    where: {
      productId: id,
    },
    include: [{ model: users, attribute: ["id", "name"] }],
  });

  if (!allSuivi) return res.json({ success: false });

  const product = await products.findOne({
    where: {
      id: id,
    },
    include: [{ model: productTypes, attribute: ["id", "name"] }],
  });

  const fiche = [
    { label: "Type de ménuiserie", value: product.dataValues.productType.name },
    { label: "Hauteur et Largeur", value: product.dataValues.dimension },
    { label: "Devis", value: product.dataValues.devis },
    { label: "Emplacement", value: product.dataValues.location },
    { label: "Détails", value: product.dataValues.detail },
  ];

  res.json({ success: true, suivis: allSuivi, product: fiche });
};

const addSuivi = async (req, res) => {
  const { productId, problem, solution, observation } = await req.body;
  const userId = await req.user;

  console.log(userId);
  if (!productId || !problem || !solution || !userId)
    return res.json({ success: false });

  const newSuivi = await suivis.create({
    productId,
    problem,
    solution,
    observation,
    userId,
  });

  if (!newSuivi) return res.json({ success: false });

  const allSuivis = await suivis.findAll({
    where: {
      productId: productId,
    },
    include: [{ model: users, attribute: ["id", "name"] }],
  });

  if (!allSuivis) return res.json({ success: false });

  res.json({ success: true, suivis: allSuivis });
};

module.exports = { getByProduct, addSuivi };
