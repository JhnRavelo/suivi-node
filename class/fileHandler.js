const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const importFileToDatabase = require("../utils/importDatabase");
const fsExtra = require("fs-extra");
const AdmZip = require("adm-zip");
const archiver = require("archiver");
const generateDataJWT = require("../utils/generateDataJWT");
const generateRandomText = require("../utils/generateRandomText");
const createUserViaTmp = require("../utils/createUserViaTmp");

let zipEncryptedRegistered = false;

if (!zipEncryptedRegistered) {
    try {
        archiver.registerFormat("zip-encrypted", require("archiver-zip-encrypted"));
        zipEncryptedRegistered = true;
    } catch (error) {
        console.error("Erreur lors de l'enregistrement du format zip-encrypted :", error.message);
    }
}

class FileHandler {
  constructor() {
    const date = new Date();
    this.dateArray = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
    this.pathExport = path.join(__dirname, "..", "database", "export");
  }

  getDate() {
    const date = new Date();
    return `${
      date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds()
    }`;
  }

  createDirectory(dirPath, index) {
    if (
      fs.existsSync(path.join(dirPath, `${this.dateArray[index]}`)) &&
      index < this.dateArray.length
    ) {
      return this.createDirectory(
        path.join(dirPath, `${this.dateArray[index]}`),
        index + 1
      );
    } else if (
      !fs.existsSync(path.join(dirPath, `${this.dateArray[index]}`)) &&
      index < this.dateArray.length
    ) {
      fs.mkdirSync(path.join(dirPath, `${this.dateArray[index]}`), {
        recursive: true,
      });
      return this.createDirectory(
        path.join(dirPath, `${this.dateArray[index]}`),
        index + 1
      );
    } else {
      return dirPath;
    }
  }

  readDirectory(exportPath, filesArray = []) {
    const files = fs.readdirSync(exportPath);
    files.forEach((file) => {
      const filePath = path.join(exportPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        this.readDirectory(filePath, filesArray);
      } else {
        filesArray.push(filePath);
      }
    });
    return filesArray;
  }

  createFile(fileName, data, ext, filePath, type) {
    let name, fileDir, location;
    const date = `-${this.getDate()}.`;
    if(!fs.existsSync(filePath)){
      fs.mkdirSync(filePath)
    }
    if (type == "tmpApp") {
      name = fileName + "." + ext;
      fileDir = filePath;
      location = path.join(filePath, name);
    } else {
      name = fileName + date + ext;
      fileDir = this.createDirectory(filePath, 0);
      if (type == "public") {
        const publicPath = path.join(fileDir, name).split("public")[1];
        location = `${process.env.SERVER_PATH}${publicPath.replace(
          /\\/g,
          "/"
        )}`;
      } else location = path.join(fileDir, name);
    }
    fs.writeFileSync(path.join(fileDir, name), data, {
      encoding: "utf8",
      flag: "w",
    });
    return { fileDir, location, date };
  }

  async createImage(req, imgPath) {
    const galleryArray = new Array();
    const response = req.files.map(async (file) => {
      if (file.mimetype.split("/")[0] == "image") {
        let webpData = await sharp(file.buffer).webp().toBuffer();
        const { location } = this.createFile(
          file.originalname.split(".")[0],
          webpData,
          "webp",
          imgPath,
          "public"
        );
        galleryArray.push(location);
      }
    });
    await Promise.all(response);
    return galleryArray.join(",");
  }

  deleteFileFromDatabase(deleted, dirPath, type) {
    const location = deleted.split(type)[1];
    let filePath;
    if (type == "pdf") {
      filePath = path.join(dirPath, location + "pdf");
    } else filePath = path.join(dirPath, location);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  extractZipAsync(zipFilePath, destinationPath) {
    return new Promise((resolve, reject) => {
      const zip = new AdmZip(zipFilePath);
      try {
        zip.extractAllTo(
          destinationPath,
          true,
          false,
          process.env.ZIP_PASSWORD
        );
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  async compressZip(zipFile, dirPath, res, filePath, date) {
    const output = fs.createWriteStream(path.join(dirPath, `export${date}zip`));
    const archive = archiver.create("zip-encrypted", {
      zlib: { level: 8 },
      encryptionMethod: process.env.ZIP_METHOD,
      password: process.env.ZIP_PASSWORD,
    });
    output.on("close", function () {
      console.log(archive.pointer() + " total bytes");
      res.download(output.path);
      fs.unlinkSync(filePath);
    });

    // @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on("end", function () {
      console.log("Data has been drained");
    });

    archive.on("warning", function (err) {
      if (err.code === "ENOENT") {
        console.log("WARNING ENOENT");
      } else {
        throw err;
      }
    });

    archive.on("error", function (err) {
      res.json({ success: false, message: "Erreur compression" });
      throw err;
    });
    archive.pipe(output);
    archive.file(path.join(dirPath, zipFile), { name: zipFile });
    archive.directory(path.join(__dirname, "..", "public"), false);
    archive.finalize();
  }

  async decompressZip(zipPath, dirPath, action) {
    try {
      const publicPath = path.join(__dirname, "..", "public");
      const outputPath = path.join(dirPath, "/import");
      await this.extractZipAsync(zipPath, outputPath);
      let result = {
        success: true,
        message: "Succès de l'importation de la base de données",
      };
      const files = fs.readdirSync(outputPath);
      await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(outputPath, file);
          if (file.includes(".sequelize")) {
            const isImport = await importFileToDatabase(filePath);
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
  }

  async getExport () {
    const exportDirs = this.readDirectory(this.pathExport)
    const files = await Promise.all(
      exportDirs.map((item, index) => {
        const pathExports = item.split(`\\`);
        const fileWithExt = pathExports[pathExports.length - 1];
        if (
          fileWithExt.split(".")[1] == "tmp" &&
          pathExports[pathExports.length - 2] != "export"
        ) {
          const fileName = fileWithExt.split(".")[0];
          const day = pathExports[pathExports.length - 2];
          const month = pathExports[pathExports.length - 3];
          const year = pathExports[pathExports.length - 4];
          const times = fileName.split("-");
          const seconds = times[times.length - 1];
          const minutes = times[times.length - 2];
          const hours = times[times.length - 3];
          return {
            id: index,
            name: `Sauvegarde ${index}`,
            path: item,
            time: fileName.slice(10),
            dirPath: path.join(this.pathExport, year, month, day),
            createdAt: `${
              day +
              "/" +
              month +
              "/" +
              year +
              " " +
              hours +
              ":" +
              minutes +
              ":" +
              seconds
            }`,
          };
        } else {
          return undefined;
        }
      })
    ).then((item) => item.filter((item) => item !== undefined));
    return files;
  };

  generateUser (user) {
    if (user) {
      const stringDataUser = generateDataJWT(user);
      fs.readdir(this.pathExport, (err, files) => {
        if (err) return console.log("ERROR READ DIRECTORY", err);
        const tempFile = files.find((item) => item.includes(".tmp"));
        if (tempFile) {
          fs.unlinkSync(path.join(this.pathExport, tempFile));
        }
        const { location } = this.createFile(
          generateRandomText(10),
          stringDataUser,
          "tmp",
          this.pathExport,
          "tmpApp"
        );
        if (!location) return console.log("ERROR CREATE FILE");
      });
    } else {
      fs.readdir(this.pathExport, async (err, files) => {
        if (err) return console.log("ERROR READ DIRECTORY", err);
        const tempFile = files.find((item) => item.includes(".tmp"));
        if (tempFile) {
          await createUserViaTmp(path.join(this.pathExport, tempFile));
        }
      });
    }
  };
}

module.exports = FileHandler;
