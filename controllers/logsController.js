const {
  logs,
  products,
  suivis,
  productTypes,
  users,
  problems,
} = require("../database/models");
const sequelize = require("sequelize");
const cc = require("node-console-colors");
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
              attributes: ["name"],
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
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!allLogs) return res.json({ success: false });

    let filterLogs = [];
    let logsAll = [];

    allLogs.map((log) => {
      const value = log.dataValues;
      const problem = getProblem(value.suivi);
      if (value.unRead) {
        filterLogs.push(
          `${value.suivi.user.name} a effectué un suivi du produit ${
            value.suivi.product.productType.name
          } du devis ${value.suivi.product.devis};${value.createdAt.slice(
            0,
            16
          )}`
        );
      }
      logsAll.push({
        log: `${value.suivi.user.name} a effectué un suivi du produit ${value.suivi.product.productType.name} du devis ${value.suivi.product.devis} associé au client ${value.suivi.product.client}`,
        year: value.year,
        createdAt: value.createdAt,
        problem: problem,
        solution: value.suivi.solution,
      });
    });
    console.log(cc.set("fg_blue", "LOG"), logsAll);
    res.json({ success: true, logs: filterLogs, allLogs: logsAll });
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
