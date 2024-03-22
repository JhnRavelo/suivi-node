const fs = require("fs")
const path = require("path")

function readDirectory(directoryPath, filesArray = []) {
    const files = fs.readdirSync(directoryPath);
    files.forEach(file => {
        const filePath = path.join(directoryPath, file);
        if (fs.statSync(filePath).isDirectory()) {
            readDirectory(filePath, filesArray);
        } else {
            filesArray.push(filePath);
        }
    });

    return filesArray;
}

module.exports = readDirectory