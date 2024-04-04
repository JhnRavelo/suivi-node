const {
  logs,
  products,
  suivis,
  productTypes,
  users,
  problems,
} = require("../database/models");
const sequelize = require("sequelize");
const getProblem = require("../utils/getProblem");

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
              attributes: ["name", "id"],
            },
            {
              model: problems,
              as: "problems",
            },
          ],
        },
      ],
      attributes: [
        [sequelize.literal("YEAR(logs.createdAt)"), "year"],
        "createdAt",
        "unRead",
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!allLogs) return res.json({ success: false });

    let filterLogs = [];
    let logsAll = [];

    allLogs.map((log) => {
      const value = log.dataValues;
      if (value.unRead && value.suivi) {
        filterLogs.push(
          `${value.suivi.user.name} a effectué un suivi du produit ${
            value.suivi.product.productType.name
          } du devis ${value.suivi.product.devis};${value.createdAt.slice(
            0,
            16
          )}`
        );
      }

      if (value.suivi) {
        const problem = getProblem(value.suivi);
        logsAll.push({
          year: value.year,
          createdAt: value.createdAt,
          problem: problem,
          solution: value.suivi.solution,
          productId: value.suivi.product.id,
          userId: value.suivi.user.id,
          productTypeId: value.suivi.product.productType.id,
        });
      }
    });
    res.json({
      success: true,
      logs: filterLogs,
      allLogs: logsAll,
    });
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR getLogs", error);
  }
};

const readLogs = async (req, res) => {
  try {
    const unReadLogs = await logs.update(
      { unRead: false },
      {
        where: {
          unRead: true,
        },
      }
    );
    if (!unReadLogs) return res.json({ success: false });
    res.json({ success: true });
  } catch (error) {
    console.log("ERROR readLogs", error);
  }
};

module.exports = { getLogs, readLogs };
