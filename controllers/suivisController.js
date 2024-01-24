const { Op } = require("sequelize");
const { users, suivis, products, productTypes } = require("../database/models");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const imgPath = path.join(__dirname, "..", "public", "img");

const imgDelete = path.join(
  __dirname,
  "..",
  "public",
  "img",
  "image0-3-1-2024-1706073017951.png"
);

const getByProduct = async (req, res) => {
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

  const allSuivi = await suivis.findAll({
    where: {
      productId: id,
    },
    include: [{ model: users, attribute: ["id", "name"] }],
  });

  if (!allSuivi) return res.json({ success: false });

  const product = await products.findOne({
    where: {
      id: id,
    },
    include: [{ model: productTypes, attribute: ["id", "name"] }],
  });

  const fiche = [
    { label: "Type de ménuiserie", value: product.dataValues.productType.name },
    { label: "Hauteur et Largeur", value: product.dataValues.dimension },
    { label: "Devis", value: product.dataValues.devis },
    { label: "Emplacement", value: product.dataValues.location },
    { label: "Détails", value: product.dataValues.detail },
  ];

  res.json({ success: true, suivis: allSuivi, product: fiche });
};

const addSuivi = async (req, res) => {
  const { productId, problem, solution, observation } = await req.body;
  const userId = await req.user;

  if (!productId || !problem || !solution || !userId)
    return res.json({ success: false });

  const newSuivi = await suivis.create({
    productId,
    problem,
    solution,
    observation,
    userId,
  });

  if (!newSuivi) return res.json({ success: false });

  res.json({ success: true, id: newSuivi.dataValues.id });
};

const deleteSuivi = async (req, res) => {
  let galleryArray;
  const { deleteId, productId } = await req.body;

  if (!deleteId || !productId) return res.json({ success: false });

  const deleteSuivi = await suivis.findOne({
    where: {
      id: deleteId,
    },
  });

  if (!deleteSuivi) return res.json({ success: false });

  const galleryString = deleteSuivi.dataValues.observation.split(";")[1];

  if (galleryString && galleryString != "null") {
    galleryArray = galleryString.split(",");
  }

  if (galleryArray) {
    galleryArray.map((gallery) => {
      let name = gallery.split("/")[gallery.split("/").length - 1];
      let pathFile = path.join(imgPath, name);
      fs.unlinkSync(pathFile, (err) => {
        if (err) {
          console.log(err);
        }
      });
      // console.log(name, "ARRAY");
    });
  } else if (!galleryArray && galleryString && galleryString != "null") {
    let name = galleryString.split("/")[galleryString.split("/").length - 1];
    let pathFile = path.join(imgPath, name);
    fs.unlinkSync(pathFile, (err) => {
      if (err) {
        console.log(err);
      }
    });
  }

  const result = await deleteSuivi.destroy();

  if (!result) return res.json({ success: false });

  const allSuivis = await suivis.findAll({
    where: {
      productId: productId,
    },
    include: [{ model: users, attribute: ["id", "name"] }],
  });

  res.json({ success: true, suivis: allSuivis });
};

const uploadImageSuivi = async (req, res) => {
  const { id, productId } = await req.body;

  let gallery = "null";
  let response;

  if (!id) return res.json({ success: false });

  const addedSuivi = await suivis.findOne({
    where: {
      id: id,
    },
  });

  if (!id) return res.json({ success: false });

  if (req?.files?.length) {
    const galleryArray = new Array();
    response = req.files.map(async (file) => {
      if (file.mimetype.split("/")[0] == "image") {
        await sharp(file.path)
          .webp()
          .toFile(`${imgPath}/${file.filename.split(".")[0]}.webp`);
        galleryArray.push(
          `${process.env.SERVER_PATH}/img/${file.filename.split(".")[0]}.webp`
        );
      }
    });
    await Promise.all(response);
    gallery = galleryArray.join(",");
  }

  if (gallery !== "null") {
    fs.readdir(imgPath, (err, files) => {
      if (err) {
        console.error("Erreur lors de la lecture du dossier :", err);
      }

      // Filtrer les fichiers PNG
      const pngFiles = files.filter(
        (file) => path.extname(file).toLowerCase() === ".png"
      );
      if (pngFiles) {
        // Supprimer chaque fichier PNG
        pngFiles.forEach((pngFile) => {
          const filePath = path.join(imgPath, pngFile);

          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(
                `Erreur lors de la suppression de ${pngFile} :`,
                err
              );
            } else {
              console.log(`${pngFile} a été supprimé avec succès.`);
            }
          });
        });
      }
    });
  }

  let observation = addedSuivi.dataValues.observation;

  addedSuivi.observation = `${observation};${gallery}`;

  const result = await addedSuivi.save();

  if (!result) return res.json({ success: false });

  const allSuivis = await suivis.findAll({
    where: {
      productId: productId,
    },
    include: [{ model: users, attribute: ["id", "name"] }],
  });

  res.json({ success: true, suivis: allSuivis });
};

const deletePNG = async () => {
  fs.readdir(imgPath, (err, files) => {
    if (err) {
      console.error("Erreur lors de la lecture du dossier :", err);
    }

    // Filtrer les fichiers PNG
    const pngFiles = files.filter(
      (file) => path.extname(file).toLowerCase() === ".png"
    );
    if (pngFiles) {
      // Supprimer chaque fichier PNG
      pngFiles.forEach((pngFile) => {
        const filePath = path.join(imgPath, pngFile);

        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Erreur lors de la suppression de ${pngFile} :`, err);
          } else {
            console.log(`${pngFile} a été supprimé avec succès.`);
          }
        });
      });
    }
  });
};

module.exports = {
  getByProduct,
  addSuivi,
  deleteSuivi,
  uploadImageSuivi,
  deletePNG,
};
