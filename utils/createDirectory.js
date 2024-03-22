const date = new Date();
const fs = require("fs");
const { join } = require("path");
const dateArray = [date.getFullYear(), date.getMonth() + 1, date.getDate()];

const createDirectory = (path, index) => {
  if (
    fs.existsSync(join(path, `${dateArray[index]}`)) &&
    index < dateArray.length
  ) {
    return createDirectory(join(path, `${dateArray[index]}`), index + 1);
  } else if (
    !fs.existsSync(join(path, `${dateArray[index]}`)) &&
    index < dateArray.length
  ) {
    fs.mkdirSync(join(path, `${dateArray[index]}`), {recursive: true});
    return createDirectory(join(path, `${dateArray[index]}`), index + 1);
  } else {
    return path;
  }
};

module.exports = createDirectory;
