const createDirectory = require("./createDirectory");

const getDate = () => {
  const date = new Date();
  return `${
    date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds()
  }`;
};

const createFile = (fileName, data, fs, path, ext, filePath, type) => {
  let name, fileDir, location;
  const date = `-${getDate()}.`
  if (type == "tmpApp") {
    name = fileName + "." + ext;
    fileDir = filePath
    location = path.join(filePath, name);
  } else {
    name = fileName + date + ext;
    fileDir = createDirectory(filePath, 0);
    if (type == "public") {
      const publicPath = path.join(fileDir, name).split("public")[1];
      location = `${process.env.SERVER_PATH}${publicPath.replace(/\\/g, "/")}`;
    } else location = path.join(fileDir, name);
  }
  fs.writeFileSync(path.join(fileDir, name), data, {
    encoding: "utf8",
    flag: "w",
  });
  return { fileDir: fileDir, location: location, date };
};

module.exports = { createFile, getDate };
