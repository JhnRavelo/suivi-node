const { productTypes } = require("../database/models");
const fs = require("fs");
const { Op } = require("sequelize");
const path = require("path");
const getProductTypes = require("../utils/getProductTypes");
const { createFile } = require("../utils/createFile");
const deleteFile = require("../utils/deleteFile");

const pdfFolderPath = path.join(__dirname, "..", "public", "pdf");

const getAllProductTypes = async (req, res) => {
  try {
    const allProductTypes = await getProductTypes(productTypes, res, Op);
    res.json({ success: true, productTypes: allProductTypes });
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR GETALLPRODUCTTYPES", error);
  }
};

const addProductType = async (req, res) => {
  try {
    const { name } = await req.body;
    let pdfBuffer;

    if (req?.files[0]?.buffer) {
      pdfBuffer = req?.files[0]?.buffer;
    }

    if (!name) return res.json({ success: false });
    const newProductType = await productTypes.create({
      name: name,
    });

    if (!newProductType) return res.json({ success: false });

    if (pdfBuffer) {
      const { location } = createFile(
        req.files[0].originalname.split(".")[0],
        pdfBuffer,
        fs,
        path,
        "pdf",
        pdfFolderPath,
        "public"
      );
      newProductType.pdf = location;
      const result = await newProductType.save();

      if (!result) return res.json({ success: false });
    }
    const allProductTypes = await getProductTypes(productTypes, res, Op);
    res.json({ success: true, types: allProductTypes });
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR ADDPRODUCTTYPE", error);
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
      deleteFile(deletedProductType.pdf, pdfFolderPath, fs, path, "pdf")
    }
    deletedProductType.set({
      name: null,
      pdf: null,
      createdAt: null,
      updatedAt: null,
    });
    const result = await deletedProductType.save();

    if (!result) return res.json({ success: false });
    const allProductTypes = await getProductTypes(productTypes, res, Op);
    res.json({ success: true, types: allProductTypes });
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR DELETEPRODUCTTYPE", error);
  }
};

const updateProductTypes = async (req, res) => {
  try {
    const { name, id } = await req.body;
    const pdfBuffer = await req?.files[0]?.buffer;

    if (!name || !id) return res.json({ success: false });
    const updatedProductType = await productTypes.findOne({
      where: {
        id: id,
      },
    });

    if (!updatedProductType) return res.json({ success: false });

    if (updatedProductType.dataValues?.pdf && pdfBuffer) {
      deleteFile(updatedProductType.pdf, pdfFolderPath, fs, path, "pdf")
      // await deletePDF(updatedProductType, pdfFolderPath, fs, path);
    }

    if (pdfBuffer) {
      const { location } = createFile(
        req.files[0].originalname.split(".")[0],
        pdfBuffer,
        fs,
        path,
        "pdf",
        pdfFolderPath,
        "public"
      );
      updatedProductType.pdf = location;
    }
    updatedProductType.name = name;
    const result = await updatedProductType.save();

    if (!result) return res.json({ success: false });
    const allProductTypes = await getProductTypes(productTypes, res, Op);
    res.json({ success: true, types: allProductTypes });
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR UPDATEPRODUCTTYPE", error);
  }
};

module.exports = {
  getAllProductTypes,
  addProductType,
  deleteProductType,
  updateProductTypes,
};
