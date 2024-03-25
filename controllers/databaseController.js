const db = require("../database/models");
const sqEI = require("../database/sequelize-import-export");
const path = require("path");
const fs = require("fs");
const cc = require("node-console-colors");
const jwt = require("jsonwebtoken");
const generateRandomText = require("../utils/generateRandomText");
const readDirectory = require("../utils/readDirectory");
const getExport = require("../utils/getExport");
const { createFile, getDate } = require("../utils/createFile");
const importFileToDatabase = require("../utils/importDatabase");
const createUserViaTmp = require("../utils/createUserViaTmp");

const exportPath = path.join(__dirname, "..", "database", "export");
const importPath = path.join(__dirname, "..", "database", "import");

const exportDatabase = async (req, res) => {
  try {
    const dbex = new sqEI(db);
    const users = await db.users.findAll({
      where: {
        role: process.env.PRIME2,
      },
    });
    const dataStringInFile = db.users.prototype.generateData(users);
    const { fileDir } = createFile(
      generateRandomText(10),
      dataStringInFile,
      fs,
      path,
      "tmp",
      exportPath
    );
    const exportFileName = `export-${getDate()}.sequelize`;
    const pathExportFile = path.join(fileDir, exportFileName);
    dbex
      .export(pathExportFile, { excludes: ["users"] })
      .then((path) => {
        res.download(path);
      })
      .catch((err) => {
        res.json({
          success: false,
          message: "Erreur dans l'exportation dans le sequelize",
        });
        console.log("ERROR EXPORT SEQUELIZE", err);
      });
  } catch (error) {
    res.json({
      success: false,
      message: "Erreur dans l'exportation du base de données",
    });
    console.log("ERROR EXPORT DATABASE", error);
  }
};

const importDatabase = async (req, res) => {
  try {
    if (!req.files)
      return res.json({ success: false, message: "Aucun fichier envoyer" });
    if (!req.files[0].originalname.includes(".sequelize"))
      return res.json({
        success: false,
        message: "Le fichier doit être de type sequelize",
      });
    const fileBuffer = req.files[0].buffer;
    const { location } = createFile(
      "import",
      fileBuffer,
      fs,
      path,
      "sequelize",
      importPath
    );
    const isImport = importFileToDatabase(sqEI, location, db);
    if (!isImport)
      return res.json({
        success: false,
        message: "Importation de la base de données échouer",
      });
    res.json({
      success: true,
      message: "Succès de l'importation de la base de données",
    });
  } catch (error) {
    console.log("ERROR IMPORT DATABASE", error);
  }
};

const readExport = async (req, res) => {
  try {
    const exportDirs = readDirectory(exportPath);
    const files = await getExport(exportDirs, path, exportPath);
    res.json({ success: true, files: files });
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR READ EXPORT", error);
  }
};

const restoreExport = async (req, res) => {
  try {
    const { file } = await req.body;
    let result = { success: true, message: "Base de données restaurer" };
    console.log("FILE", file);
    fs.readdir(file.dirPath, (err, files) => {
      if (err) {
        console.log("ERROR READ DIRECTORY RESTORE EXPORT", err);
        result.success = false;
        result.message = "Erreur de lecture du dossier de Restauration";
      }
      const filterFiles = files.filter((filterFile) =>
        filterFile.includes(file.time)
      );
      Promise.all(
        filterFiles.map(async (filterFile) => {
          if (filterFile.split(".")[1].includes("tmp")) {
            await createUserViaTmp(
              fs,
              path.join(file.dirPath, filterFile),
              jwt,
              db
            );
          } else {
            const error = await importFileToDatabase(
              sqEI,
              path.join(file.dirPath, filterFile),
              db
            );
            if (error) {
              result.success = false;
              result.message =
                "Erreur durant l'importation de la base";
              return;
            }
          }
        })
      );
      res.json(result);
    });
  } catch (error) {
    res.json({ success: false, message: "Erreur de la Restauration" });
    console.log("ERROR RESTORE EXPORT", error);
  }
};

module.exports = { exportDatabase, importDatabase, readExport, restoreExport };
