const db = require("../database/models");
const sqEI = require("../database/sequelize-import-export");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const generateRandomText = require("../utils/generateRandomText");
const readDirectory = require("../utils/readDirectory");
const getExport = require("../utils/getExport");
const { createFile } = require("../utils/createFile");
const createUserViaTmp = require("../utils/createUserViaTmp");
const compressZip = require("../utils/compressZip");
const generateDataJWT = require("../utils/generateDataJWT");
const decompressZip = require("../utils/decompressZip");

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
    const dataStringInFile = generateDataJWT(users);
    const { fileDir, date } = createFile(
      generateRandomText(10),
      dataStringInFile,
      fs,
      path,
      "tmp",
      exportPath
    );
    const exportFileName = `export${date}sequelize`;
    const pathExportFile = path.join(fileDir, exportFileName);
    dbex
      .export(pathExportFile, { excludes: ["users"] })
      .then(async (pathFile) => {
        compressZip(exportFileName, fs, path, fileDir, res, pathFile, date);
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
    if (!req.files[0].originalname.includes(".zip"))
      return res.json({
        success: false,
        message: "Le fichier doit être un archive ZIP",
      });
    const fileBuffer = req.files[0].buffer;
    const { location, fileDir } = createFile(
      "import",
      fileBuffer,
      fs,
      path,
      "zip",
      importPath,
      "tmpApp"
    );
    const result = await decompressZip(location, fs, path, fileDir, sqEI, db);
    res.json(result);
  } catch (error) {
    res.json({ success: false, message: "Importation des données échouer" });
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
    const files = fs.readdirSync(file.dirPath)
      const filterFiles = files.filter((filterFile) =>
        filterFile.includes(file.time)
      );
      console.log(filterFiles)
      await Promise.all(
        filterFiles.map(async (filterFile) => {
          if (filterFile.split(".")[1].includes("tmp")) {
            await createUserViaTmp(
              fs,
              path.join(file.dirPath, filterFile),
              jwt,
              db
            );
          } else {
            const response = await decompressZip(
              path.join(file.dirPath, filterFile),
              fs,
              path,
              importPath,
              sqEI,
              db,
              "restore"
            );
            if (!response.success) {
              result.success = response.success;
              result.message = response.message;
            }
          }
        })
      );
      res.json(result);
  } catch (error) {
    res.json({ success: false, message: "Erreur de la Restauration" });
    console.log("ERROR RESTORE EXPORT", error);
  }
};

const deleteExport = async (req, res) => {
  try {
    const { file } = await req.body;
    fs.readdir(file.dirPath, async (err, files) => {
      if (err) {
        return res.json({
          success: false,
          message: "Erreur de lecture du dossier de Restauration",
        });
      }
      const filterFiles = files.filter((item) => item.includes(file.time));
      await Promise.all(
        filterFiles.map((item) => {
          fs.unlinkSync(path.join(file.dirPath, item));
        })
      );
      await readExport(req, res);
    });
  } catch (error) {
    console.log("ERROR DELETE EXPORT", error);
  }
};

module.exports = {
  exportDatabase,
  importDatabase,
  readExport,
  restoreExport,
  deleteExport,
};
