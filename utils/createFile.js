const createDirectory = require("./createDirectory");

const getDate = () => {
  const date = new Date();
  return `${
    date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds()
  }`;
};

const createFile = (fileName, data, fs, path, ext, filePath, type) => {
  let name, fileDir;
  if (type == "tmpApp") {
    name = fileName + "." + ext
    fileDir = filePath
  } else {
    name = fileName + `-${getDate()}.` + ext;
    fileDir = createDirectory(filePath, 0);
  }
  fs.writeFileSync(path.join(fileDir, name), data, {
    encoding: "utf8",
    flag: "w",
  });
  return { fileDir: fileDir, location: path.join(fileDir, name) };
};

module.exports = { createFile, getDate };
