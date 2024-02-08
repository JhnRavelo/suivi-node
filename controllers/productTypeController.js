const { productTypes } = require("../database/models");
const fs = require("fs");
const pdfPoppler = require("pdf-poppler");
const path = require("path");

const pdfPath = path.join(
  __dirname,
  "..",
  "public",
  "pdf",
  "temporaire.pdf"
);

const pdfOutput = path.join(__dirname, "..", "public", "img");

const getAllProductTypes = async (req, res) => {
  const allProductTypes = await productTypes.findAll();

  if (!allProductTypes) return res.json({ success: false });

  res.json({ success: true, productTypes: allProductTypes });
};

const addProductType = async (req, res) => {
  try {
    const { name } = await req.body;
    const pdfBuffer = req.files[0]?.buffer;
    let imagePaths = [];
    let imageFiles = [];
    let newPDF;
    if (!name) return res.json({ success: false });
    if (pdfBuffer) {
      fs.writeFileSync(pdfPath, pdfBuffer);
      const originalname = req.files[0].originalname.split(".")[0];
      const date = new Date();
      const prefix = `${originalname}-${date.getDate()}-${
        date.getMonth() + 1
      }-${date.getFullYear()}`;
      const options = {
        format: "jpg",
        out_dir: pdfOutput,
        out_prefix: prefix,
        page: null,
      };

      pdfPoppler
        .convert(pdfPath, options)
        .then(() => {
          fs.unlinkSync(pdfPath);
          fs.readdir(options.out_dir, async (err, files) => {
            if (err) {
              console.error(
                "Erreur lors de la lecture du dossier de sortie :",
                err
              );
              return;
            }

            imageFiles = files.filter((file) =>
              file.startsWith(options.out_prefix)
            );
            if (imageFiles.length > 0) {
              const response = imageFiles.map((item) =>
                imagePaths.push(
                  `${process.env.SERVER_PATH}/img/${item}`
                )
              );
              await Promise.all(response);

              newPDF = imagePaths.join(",");
              console.log(newPDF);
              const newProductType = await productTypes.create({
                name: name,
                pdf: newPDF,
              });

              if (!newProductType)
                return res.json({ success: false });
              const allProductTypes = await productTypes.findAll();

              if (!allProductTypes)
                return res.json({ success: false });

              res.json({ success: true, types: allProductTypes });
            }
          });
        })
        .catch((error) => {
          console.error("Erreur lors de la conversion :", error);
          fs.unlinkSync(pdfPath);
        });
    } else {
      const newProductType = await productTypes.create({
        name: name,
      });
      if (!newProductType) return res.json({ success: false });

      const allProductTypes = await productTypes.findAll();

      if (!allProductTypes) return res.json({ success: false });

      res.json({ success: true, types: allProductTypes });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
};

const deleteProductType = async (req, res) => {
  const id = await req?.params?.id;
  try {
    if (!id) return res.json({ success: false });

    const deletedProductType = await productTypes.findOne({
      where: {
        id: id,
      },
    });

    if (deletedProductType.dataValues?.pdf) {
      const arrayProductTypes =
        deletedProductType.dataValues.pdf.split(",");
      arrayProductTypes.map((item) => {
        let name = item.split("/")[item.split("/").length - 1];
        let deltePath = path.join(pdfOutput, name);
        fs.unlinkSync(deltePath, (err) => {
          if (err) {
            console.log(err);
          }
        });
      });
    }

    const result = await deletedProductType.destroy();

    if (!result) return res.json({ success: false });

    const allProductTypes = await productTypes.findAll();

    if (!allProductTypes) return res.json({ success: false });

    res.json({ success: true, types: allProductTypes });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllProductTypes,
  addProductType,
  deleteProductType,
};
