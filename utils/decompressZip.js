const importFileToDatabase = require("./importDatabase");
const fsExtra = require("fs-extra");
const AdmZip = require("adm-zip")

function decompressZipAsync(zipFilePath, destinationPath) {
  return new Promise((resolve, reject) => {
      const zip = new AdmZip(zipFilePath);
      try {
          zip.extractAllTo(destinationPath, true);
          resolve();
      } catch (err) {
          reject(err);
      }
  });
}


const decompressZip = async (zipPath, fs, path, dirPath, sqEI, db, res) => {
  try {
    const publicPath = path.join(__dirname, "..", "public");
    const outputPath = path.join(dirPath, "/import");
    await decompressZipAsync(zipPath, outputPath)
      fs.readdir(outputPath, async (err, files) => {
        const result = await Promise.all(
          files.map(async (file) => {
            let result = {};
            const filePath = path.join(outputPath, file);
            if (file.includes(".sequelize")) {
              const isImport = importFileToDatabase(sqEI, filePath, db);

              if (!isImport) {
                result.success = false;
                result.message = "Importation de la base de données échouée";
              } else {
                result.success = true;
                result.message =
                  "Succès de l'importation de la base de données";
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
        const successLength = result.filter(
          (item) => item.success == true
        ).length;
        fs.unlinkSync(zipPath);
        fsExtra.remove(outputPath);
        if (successLength === 1) {
          res.json(result[0]);
        } else {
          res.json(result[0]);
        }
      });
  } catch (error) {
    res.json({
      success: false,
      message: "Erreur lors de l'extraction du fichier ZIP",
    });
    console.log("DECOMPRESS ERROR", error);
  }
};

module.exports = decompressZip;
