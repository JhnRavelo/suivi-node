const importFileToDatabase = require("./importDatabase");
const fsExtra = require("fs-extra");
const AdmZip = require("adm-zip");

function decompressZipAsync(zipFilePath, destinationPath) {
  return new Promise((resolve, reject) => {
    const zip = new AdmZip(zipFilePath);
    try {
      zip.extractAllTo(destinationPath, true, false, process.env.ZIP_PASSWORD);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

const decompressZip = async (zipPath, fs, path, dirPath, sqEI, db, action) => {
  try {
    const publicPath = path.join(__dirname, "..", "public");
    const outputPath = path.join(dirPath, "/import");
    await decompressZipAsync(zipPath, outputPath);
    let result = {
      success: true,
      message: "Succès de l'importation de la base de données",
    };
    const files = fs.readdirSync(outputPath);
    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(outputPath, file);
        if (file.includes(".sequelize")) {
          const isImport = await importFileToDatabase(sqEI, filePath, db);
          if (!isImport) {
            result.success = false;
            result.message = "Importation de la base de données échouée";
          }
        } else if (file == "pdf" || file == "img") {
          const assetDIr = path.join(publicPath, file);
          if (fs.existsSync(assetDIr)) {
            await fsExtra.remove(assetDIr);
          }
          await fsExtra.copy(filePath, path.join(publicPath, file));
        }
        return result;
      })
    );
    if (action != "restore") {
      fs.unlinkSync(zipPath);
    }
    fsExtra.remove(outputPath);
    return result;
  } catch (error) {
    console.log("DECOMPRESS ERROR", error);
    if (action != "restore") {
      fs.unlinkSync(zipPath);
    }
    fsExtra.remove(outputPath);
    return {
      success: false,
      message: "Erreur lors de l'extraction du fichier ZIP",
    };
  }
};

module.exports = decompressZip;
