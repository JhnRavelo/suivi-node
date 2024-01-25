const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const {
  getByProduct,
  addSuivi,
  deleteSuivi,
  uploadImageSuivi,
  updateSuivi
} = require("../controllers/suivisController");
const router = express.Router();
const multer = require("multer");

const memoryStokage = multer({storage: multer.memoryStorage()})

router.put("/upload", memoryStokage.any(), uploadImageSuivi);
router.post("/getByProduct", verifyJWT, getByProduct);
router.post("/addSuivi", verifyJWT, addSuivi);
router.post("/delete", verifyJWT, deleteSuivi);
router.put("/updateSuivi", verifyJWT, updateSuivi);

module.exports = router;
