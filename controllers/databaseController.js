const db = require("../database/models");
const sqEI = require("sequelize-import-export");
const path = require("path");
const fs = require("fs");
const generateRandomText = require("../utils/generateRandomText");

const exportPath = path.join(__dirname, "..", "database", "export");

const exportDatabase = async (req, res) => {
  try {
    fs.readdir(exportPath, (err, files) => {
      if (err) return console.log(err);
      const fileName = files.find((item) => item.includes(".tmp"));
      if (fileName) {
        fs.unlinkSync(path.join(exportPath, fileName));
      }
    });
    const users = await db.users.findAll();
    const dbex = new sqEI(db);
    const dataStringInFile = db.users.prototype.generateData(users);
    const fileName = generateRandomText(10);
    fs.writeFileSync(
      path.join(exportPath, `${fileName}.tmp`),
      dataStringInFile,
      {
        encoding: "utf8",
        flag: "w",
      }
    );
    const pathExportFile = path.join(exportPath, "export.sequelize");
    dbex
      .export(pathExportFile, { excludes: ["users"] })
      .then((path) => {
        res.download(path);
      })
      .catch((err) => {
        console.log("ERROR EXPORT SEQUELIZE", err);
      });
  } catch (error) {
    console.log("ERROR EXPORT DATABASE", error);
  }
};

module.exports = { exportDatabase };
