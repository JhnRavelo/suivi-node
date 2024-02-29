const { productTypes } = require("../database/models");
const fs = require("fs");
const { Op } = require("sequelize");
const path = require("path");
const getProductTypes = require("../utils/getProductTypes");

const pdfFolderPath = path.join(__dirname, "..", "public", "pdf");

const getAllProductTypes = async (req, res) => {
  try {
    const allProductTypes = await getProductTypes(productTypes, res, Op);

    res.json({ success: true, productTypes: allProductTypes });
  } catch (error) {
    console.log(error);
  }
};

const addProductType = async (req, res) => {
  try {
    const { name } = await req.body;
    const pdfBuffer = req?.files[0]?.buffer;

    if (!name) return res.json({ success: false });

    const newProductType = await productTypes.create({
      name: name,
    });
    if (!newProductType) return res.json({ success: false });

    if (pdfBuffer) {
      const originalname = req.files[0].originalname.split(".")[0];
      const date = new Date();

      const prefix = `${originalname}-${date.getDate()}-${
        date.getMonth() + 1
      }-${date.getFullYear()}.pdf`;

      const pdfPath = path.join(pdfFolderPath, prefix);
      fs.writeFileSync(pdfPath, pdfBuffer);

      const newPDF = `${process.env.SERVER_PATH}/pdf/${prefix}`;
      newProductType.pdf = newPDF;

      const result = await newProductType.save();
      if (!result) return res.json({ success: false });
    }
    const allProductTypes = await getProductTypes(productTypes, res, Op);

    res.json({ success: true, types: allProductTypes });
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
      const pdfFile = deletedProductType.dataValues.pdf;
      const pdfName = pdfFile.split("/")[pdfFile.split("/").length - 1];
      const pdfPath = path.join(pdfFolderPath, pdfName);
      fs.unlinkSync(pdfPath, (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
    deletedProductType.set({ name: null, pdf: null });

    const result = await deletedProductType.save();

    if (!result) return res.json({ success: false });
    console.log(result);
    const allProductTypes = await getProductTypes(productTypes, res, Op);

    res.json({ success: true, types: allProductTypes });
  } catch (error) {
    console.log(error);
  }
};

const updateProductTypes = async (req, res) => {
  try {
    const { name, id } = await req.body;

    const pdfBuffer = await req?.files[0]?.buffer;
    console.log(req.files);
    if (!name || !id) return res.json({ success: false });

    const updatedProductType = await productTypes.findOne({
      where: {
        id: id,
      },
    });

    if (!updatedProductType) return res.json({ success: false });

    if (updatedProductType.dataValues?.pdf && pdfBuffer) {
      const pdfFile = updatedProductType.dataValues.pdf;
      const pdfName = pdfFile.split("/")[pdfFile.split("/").length - 1];
      const pdfPath = path.join(pdfFolderPath, pdfName);
      fs.unlinkSync(pdfPath, (err) => {
        console.log(err);
      });
    }

    if (pdfBuffer) {
      const originalname = req.files[0].originalname.split(".")[0];
      const date = new Date();
      const prefix = `${originalname}-${date.getDate()}-${
        date.getMonth() + 1
      }-${date.getFullYear()}.pdf`;
      const pdfPath = path.join(pdfFolderPath, prefix);
      fs.writeFileSync(pdfPath, pdfBuffer);
      updatedProductType.pdf = `${process.env.SERVER_PATH}/pdf/${prefix}`;
    }

    updatedProductType.name = name;

    const result = await updatedProductType.save();

    if (!result) return res.json({ success: false });

    const allProductTypes = await getProductTypes(productTypes, res, Op);

    res.json({ success: true, types: allProductTypes });
  } catch (error) {
    res.json({ success: false });
    console.log(error);
  }
};

module.exports = {
  getAllProductTypes,
  addProductType,
  deleteProductType,
  updateProductTypes,
};
