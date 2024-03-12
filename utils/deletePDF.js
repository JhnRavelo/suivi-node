const deletePDF = async (deletedProductType, pdfFolderPath, fs, path) => {
  const pdfFile = deletedProductType.dataValues.pdf;
  const pdfName = pdfFile.split("/")[pdfFile.split("/").length - 1];
  const pdfPath = path.join(pdfFolderPath, pdfName);
  fs.unlinkSync(pdfPath, (err) => {
    if (err) {
      console.log(err);
    }
  });
};

module.exports = deletePDF;
