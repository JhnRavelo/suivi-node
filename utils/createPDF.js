const createPDF = async (req, pdfFolderPath, pdfBuffer, fs, path) => {
  const originalname = req.files[0].originalname.split(".")[0];
  const date = new Date();
  const prefix = `${originalname}-${date.getDate()}-${
    date.getMonth() + 1
  }-${date.getFullYear()}.pdf`;
  const pdfPath = path.join(pdfFolderPath, prefix);
  fs.writeFileSync(pdfPath, pdfBuffer);
  const newPDF = `${process.env.SERVER_PATH}/pdf/${prefix}`;
  return newPDF;
};

module.exports = createPDF;
