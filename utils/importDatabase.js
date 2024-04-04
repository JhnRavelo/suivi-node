const db = require("../database/models")
const sqEI = require("../database/sequelize-import-export")

const importFileToDatabase = (location) => {
  const dbex = new sqEI([
    db.productTypes,
    db.products,
    db.problems,
    db.suivis,
    db.logs,
  ]);
  const error = dbex
    .import(location, { overwrite: true, excludes: ["users"] })
    .then(() => {
      return true;
    })
    .catch((err) => {
      console.log("ERROR IMPORT SEQUELIZE", err);
      return false;
    });
  return error;
};

module.exports = importFileToDatabase;
