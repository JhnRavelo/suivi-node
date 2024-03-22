const db = require("../database/models");
const sqEI = require("../database/sequelize-import-export");
const path = require("path");
const fs = require("fs");
const generateRandomText = require("../utils/generateRandomText");
const createDirectory = require("../utils/createDirectory");

const exportPath = path.join(__dirname, "..", "database", "export");
const importPath = path.join(__dirname, "..", "database", "import");

const exportDatabase = async (req, res) => {
  try {
    const date = new Date();
    const dbex = new sqEI(db);
    const users = await db.users.findAll({
      where: {
        role: process.env.PRIME2,
      },
    });
    const dataStringInFile = db.users.prototype.generateData(users);
    const fileName =
      generateRandomText(10) +
      `-${
        date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds()
      }.tmp`;
    const exportDir = createDirectory(exportPath, 0);
    fs.writeFileSync(path.join(exportDir, fileName), dataStringInFile, {
      encoding: "utf8",
      flag: "w",
    });
    const exportFileName = `export-${
      date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds()
    }.sequelize`;
    const pathExportFile = path.join(exportDir, exportFileName);
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

const importDatabase = async (req, res) => {
  try {
    const date = new Date();
    const dbex = new sqEI([
      db.productTypes,
      db.products,
      db.problems,
      db.suivis,
      db.logs,
    ]);
    console.log("FILE", req.files[0]);
    if (!req.files && !req.files[0])
      return res.json({ success: false, message: "Aucun fichier envoyer" });
    if (!req.files[0].originalname.includes(".sequelize"))
      return res.json({
        success: false,
        message: "Le fichier doit être de type sequelize",
      });
    const fileBuffer = req.files[0].buffer;
    const importDir = createDirectory(importPath, 0);
    const importFileName = `import-${
      date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds()
    }.sequelize`;
    const importFilePath = path.join(importDir, importFileName);
    fs.writeFileSync(importFilePath, fileBuffer, {
      encoding: "utf8",
      flag: "w",
    });
    dbex
      .import(importFilePath, { overwrite: true, excludes: ["users"] })
      .then((file) => {
        console.log(file);
      })
      .catch((err) => console.log("ERROR IMPORT SEQUELIZE", err));
    res.json({ success: true });
  } catch (error) {
    console.log("ERROR IMPORT DATABASE", error);
  }
};

module.exports = { exportDatabase, importDatabase };
