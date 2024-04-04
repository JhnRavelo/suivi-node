const { productTypes } = require("../database/models");
const { Op } = require("sequelize");
const path = require("path");
const FileHandler = require("../class/fileHandler");
const fileHandler = new FileHandler();

const pdfFolderPath = path.join(__dirname, "..", "public", "pdf");

const getAllProductTypes = async (req, res) => {
  try {
    const allProductTypes = await productTypes.findAll({
      where: {
        name: {
          [Op.not]: null,
        },
      },
    });

    if (!allProductTypes) return res.json({ success: false });
    res.json({ success: true, types: allProductTypes });
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR GETALLPRODUCTTYPES", error);
  }
};

const addProductType = async (req, res) => {
  try {
    const { name } = await req.body;
    let pdfBuffer;
    let fileNames;

    if (req.files.length > 0) {
      fileNames = req.files[0].originalname.split(".");
      if (fileNames[fileNames.length - 1] !== "pdf") {
        console.log("ERROR PDF");
        return res.json({ success: false });
      }
      pdfBuffer = req?.files[0]?.buffer;
    }

    if (!name) return res.json({ success: false });
    const newProductType = await productTypes.create({
      name: name,
    });

    if (!newProductType) return res.json({ success: false });

    if (pdfBuffer) {
      const { location } = fileHandler.createFile(
        fileNames[0],
        pdfBuffer,
        "pdf",
        pdfFolderPath,
        "public"
      );
      newProductType.pdf = location;
      const result = await newProductType.save();

      if (!result) return res.json({ success: false });
    }
    await getAllProductTypes(req, res);
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
      fileHandler.deleteFileFromDatabase(
        deletedProductType.pdf,
        pdfFolderPath,
        "pdf"
      );
    }
    deletedProductType.set({
      name: null,
      pdf: null,
      createdAt: null,
      updatedAt: null,
    });
    const result = await deletedProductType.save();

    if (!result) return res.json({ success: false });
    await getAllProductTypes(req, res);
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
      fileHandler.deleteFileFromDatabase(
        updatedProductType.pdf,
        pdfFolderPath,
        "pdf"
      );
    }

    if (pdfBuffer) {
      const { location } = fileHandler.createFile(
        req.files[0].originalname.split(".")[0],
        pdfBuffer,
        "pdf",
        pdfFolderPath,
        "public"
      );
      updatedProductType.pdf = location;
    }
    updatedProductType.name = name;
    const result = await updatedProductType.save();

    if (!result) return res.json({ success: false });
    await getAllProductTypes(req, res);
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
