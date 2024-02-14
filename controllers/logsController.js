const {
  logs,
  products,
  suivis,
  productTypes,
  users,
} = require("../database/models");

const getLogs = async (req, res) => {
  try {
    const allLogs = await logs.findAll({
      include: [
        {
          model: suivis,
          include: [
            {
              model: products,
              include: [{ model: productTypes }],
            },
            {
              model: users,
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    if (!allLogs) return res.json({ success: false });

    let filterLogs = []
    let logsAll = []

    allLogs.map((log) => {
      let value = log.dataValues;
      if(value.unRead){
        filterLogs.push(
          `${value.suivi.user.name} a effectué un suivi du produit ${
            value.suivi.product.productType.name
          } du devis ${value.suivi.product.devis};${value.createdAt.slice(
            0,
            16
          )}`
        );
      }
      logsAll.push(`${value.suivi.user.name} a effectué un suivi du produit ${
        value.suivi.product.productType.name
      } du devis ${value.suivi.product.devis};${value.createdAt.slice(
        0,
        16
      )};${value.suivi.problem};${value.suivi.solution}`)
    });
    res.json({ success: true, logs: filterLogs, allLogs: logsAll });
  } catch (error) {
    res.json({ success: false });
    console.log(error);
  }
};

const ReadLogs = async (req, res) => {
  try {
    const unReadLogs = await logs.update(
      { unRead: false },
      {
        where: {
          unRead: true,
        },
      }
    );
    if(!unReadLogs) return res.json({success: false})
    res.json({success: true})
  } catch (error) {
    console.log(error)
  }
}

module.exports = { getLogs, ReadLogs };
