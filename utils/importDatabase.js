const importFileToDatabase = (sqEI, location, db) => {
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
      return false;
    })
    .catch((err) => {
      console.log("ERROR IMPORT SEQUELIZE", err);
      return true;
    });
  return error;
};

module.exports = importFileToDatabase;
