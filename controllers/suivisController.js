const { Op } = require("sequelize");
const { users, suivis, products } = require("../database/models");

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
  });

  if (!allSuivi) return res.json({ success: false });

  res.json({ success: true, suivis: allSuivi });
};

const addSuivi = async (req, res)=>{
  const {productId, problem, solution, observation} = await req.body

  if(!productId || !problem || !solution || !observation) return res.json({success: false})

  const newSuivi = await suivis.create({
    productId,
    problem,
    solution,
    observation
  })

  if(!newSuivi) return res.json({success: false})

  const allSuivi = await suivis.findAll({
    where: {
      productId: productId,
    },
  });

  if (!allSuivi) return res.json({ success: false });

  res.json({ success: true, suivis: allSuivi });
}

module.exports = { getByProduct, addSuivi };
