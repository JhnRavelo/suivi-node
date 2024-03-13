const { Op } = require("sequelize");
const {
  users,
  suivis,
  products,
  productTypes,
  logs,
  problems,
} = require("../database/models");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const getSuivis = require("../utils/getSuivis");
const deleteImage = require("../utils/deleteImage");
const createImage = require("../utils/createImage");
const getSuivisByProduct = require("../utils/getSuivisByProduct");

const imgPath = path.join(__dirname, "..", "public", "img");

const getByProduct = async (req, res) => {
  try {
    const { email, id } = await req.body;

    if (!email || !id) return res.json({ success: false });

    const isEmail = await users.findOne({
      where: {
        email: {
          [Op.eq]: email,
        },
      },
    });

    if (!isEmail) return res.json({ success: false });

    const allSuivi = await getSuivisByProduct(suivis, users, res, id, problems);

    const product = await products.findOne({
      where: {
        id: id,
      },
      include: [{ model: productTypes, attribute: ["id", "name"] }],
    });
    const productValue = product.dataValues;
    const fiche = [
      {
        label: "Type de ménuiserie",
        value: productValue.productType.name,
      },
      {
        label: "Hauteur et Largeur",
        value: productValue.dimension,
      },
      { label: "Devis", value: productValue.devis },
      { label: "Emplacement", value: productValue.location },
      { label: "Détails", value: productValue.detail },
      { label: "Client", value: productValue.client },
      { label: "Chantier", value: productValue.chantier },
    ];
    const allProblems = await problems.findAll({
      where: { productTypeId: productValue.productType.id },
    });

    const filterProblems = allProblems.map((item) => {
      return { value: item.dataValues.id, label: item.dataValues.name };
    });

    res.json({
      success: true,
      suivis: allSuivi,
      product: fiche,
      pdf: productValue.productType.pdf,
      problems: filterProblems,
    });
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR getByProduct", error);
  }
};

const addSuivi = async (req, res) => {
  try {
    const { productId, problem, solution, observation, problemId } =
      await req.body;
    const userId = await req.user;

    if (!productId || !problem || !solution || !userId)
      return res.json({ success: false });
    const newSuivi = await suivis.create({
      productId,
      problem,
      solution,
      observation: `${observation ? observation : ""};`,
      userId,
    });

    if (!newSuivi) return res.json({ success: false });

    if (problemId) {
      newSuivi.problemId = problemId;
      await newSuivi.save();
    }
    await logs.create({ suiviId: newSuivi.dataValues.id });
    await uploadImageSuivi(req, res, newSuivi, productId);
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR addSuivi", error);
  }
};

const deleteSuivi = async (req, res) => {
  let galleryArray;
  const { deleteId, productId } = await req.body;
  try {
    if (!deleteId) return res.json({ success: false });
    const deleteSuivi = await suivis.findOne({
      where: {
        id: deleteId,
      },
    });

    if (!deleteSuivi) return res.json({ success: false });
    const galleryString = deleteSuivi.dataValues.observation.split(";")[1];

    if (galleryString && galleryString != "") {
      galleryArray = galleryString.split(",");
    }

    if (galleryArray) {
      galleryArray.map((gallery) => {
        deleteImage(gallery, imgPath, fs, path);
      });
    } else if (!galleryArray && galleryString && galleryString != "null") {
      deleteImage(galleryString, imgPath, fs, path);
    }
    const result = await deleteSuivi.destroy();

    if (!result) return res.json({ success: false });

    if (productId) {
      const allSuivis = await getSuivisByProduct(
        suivis,
        users,
        res,
        productId,
        problems
      );
      res.json({ success: true, suivis: allSuivis });
    } else {
      const filterSuivis = await getSuivis(
        suivis,
        users,
        products,
        productTypes
      );
      res.json({ success: true, suivis: filterSuivis });
    }
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR deleteSuivi", error);
  }
};

const uploadImageSuivi = async (req, res, addedSuivi, productId) => {
  try {
    let gallery;

    if (req?.files?.length) {
      gallery = await createImage(req, imgPath, sharp, path, fs);
    }
    let observation = addedSuivi.dataValues.observation;
    addedSuivi.observation = `${observation}${gallery ? gallery : ""}`;
    const result = await addedSuivi.save();

    if (!result) return res.json({ success: false });
    const allSuivis = await getSuivisByProduct(
      suivis,
      users,
      res,
      productId,
      problems
    );
    res.json({ success: true, suivis: allSuivis });
  } catch (error) {
    res.json({ success: false });
    console.log("uploadImageSuivi", error);
  }
};

const updateSuivi = async (req, res) => {
  const { id, productId, problem, observation, solution } = await req.body;
  try {
    if (!id || !productId || !problem || !solution)
      return res.json({ success: false });
    const updatedSuivi = await suivis.findOne({ where: { id: id } });
    const gallery = updatedSuivi?.dataValues?.observation?.split(";")[1];
    const updatedObservation = `${observation ? observation : ""};${
      gallery ? gallery : ""
    }`;
    updatedSuivi.set({
      problem,
      solution,
      observation: updatedObservation,
    });
    const result = await updatedSuivi.save();

    if (!result) return res.json({ success: false });
    await updateUpload(req, res, productId, updatedSuivi);
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR updateSuivi", error);
  }
};

const updateUpload = async (req, res, productId, updatedUpload) => {
  let updateGalleryArray;
  let newGallery;
  let observation;
  try {
    observation = updatedUpload?.dataValues?.observation?.split(";")[0];

    if (req?.files?.length) {
      newGallery = await createImage(req, imgPath, sharp, path, fs);
    }
    const updateGalleryString =
      updatedUpload?.dataValues?.observation?.split(";")[1];

    if (updateGalleryString && updateGalleryString != "") {
      updateGalleryArray = updateGalleryString?.split(",");
    }

    if (updateGalleryArray) {
      updateGalleryArray.map((gallery) => {
        deleteImage(gallery, imgPath, fs, path);
      });
    } else if (
      !updateGalleryArray &&
      updateGalleryString &&
      updateGalleryString != ""
    ) {
      deleteImage(updateGalleryArray, imgPath, fs, path);
    }
    updatedUpload.observation = `${observation ? observation : ""};${
      newGallery ? newGallery : ""
    }`;
    const result = await updatedUpload.save();

    if (!result) return res.json({ success: false });
    const allSuivis = await getSuivisByProduct(
      suivis,
      users,
      res,
      productId,
      problems
    );
    res.json({ success: true, suivis: allSuivis });
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR updateUpload", error);
  }
};

const getAllSuivis = async (req, res) => {
  try {
    let year;
    const filterSuivis = await getSuivis(
      suivis,
      users,
      products,
      productTypes,
      res,
      problems
    );
    let years = [];
    const resultYear = filterSuivis.map((item) => {
      const itemYear = item.createdAt.split("-")[0];
      if (itemYear != year) {
        year = itemYear;
        years.push(itemYear);
      }
    });
    await Promise.all(resultYear);
    res.json({ success: true, suivis: filterSuivis, years: years });
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR getAllSuivis", error);
  }
};

module.exports = {
  getByProduct,
  addSuivi,
  deleteSuivi,
  uploadImageSuivi,
  updateSuivi,
  updateUpload,
  getAllSuivis,
};
