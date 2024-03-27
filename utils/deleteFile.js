const deleteFile = (deleted, dirPath, fs, path, type) => {
  const location = deleted.split(type)[1];
  let filePath;
  if (type == "pdf") {
    filePath = path.join(dirPath, location + "pdf");
  } else filePath = path.join(dirPath, location);
  console.log("FILE", filePath)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = deleteFile;
