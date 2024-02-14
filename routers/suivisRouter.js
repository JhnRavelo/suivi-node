const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const {
  getByProduct,
  addSuivi,
  deleteSuivi,
  uploadImageSuivi,
  updateSuivi,
  updateUpload,
  getAllSuivis,
} = require("../controllers/suivisController");
const router = express.Router();
const multer = require("multer");
const verifyRole = require("../middlewares/verifyRole");

const memoryStokage = multer({ storage: multer.memoryStorage() });

router.put("/upload", memoryStokage.any(), uploadImageSuivi);
router.put("/updateUpload", memoryStokage.any(), updateUpload);
router.post("/getByProduct", verifyJWT, getByProduct);
router.post("/addSuivi", verifyJWT, addSuivi);
router.post("/delete", verifyJWT, deleteSuivi);
router.put("/updateSuivi", verifyJWT, updateSuivi);
router.get("/getAll", verifyJWT, verifyRole(process.env.PRIME), getAllSuivis);

module.exports = router;
