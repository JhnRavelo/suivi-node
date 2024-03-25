const getExport = async (exportDirs, path, exportPath) => {
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
          dirPath: path.join(exportPath, year, month, day),
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

module.exports = getExport;
