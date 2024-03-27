const archiver = require("archiver");
archiver.registerFormat("zip-encrypted", require("archiver-zip-encrypted"));

const compressZip = async (zipFile, fs, path, dirPath, res, filePath, date) => {
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
};

module.exports = compressZip;
