const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const {
  getByProduct,
  addSuivi,
  deleteSuivi,
  uploadImageSuivi,
} = require("../controllers/suivisController");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const imgPath = path.join(__dirname, "..", "public", "img");

const stokage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, imgPath);
  },
  filename: (req, file, callback) => {
    const date = new Date();
    callback(
      null,
      `${file.originalname}-${date.getDay()}-${
        date.getMonth() + 1
      }-${date.getFullYear()}-${date.getTime()}.png`
    );
  },
});

const upload = multer({
  storage: stokage,
});

const multipleImage = upload.any();

router.put("/upload", multipleImage, uploadImageSuivi);
router.post("/getByProduct", verifyJWT, getByProduct);
router.post("/addSuivi", verifyJWT, addSuivi);
router.post("/delete", verifyJWT, deleteSuivi);

module.exports = router;
