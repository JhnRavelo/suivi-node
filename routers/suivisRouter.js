const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const {
  getByProduct,
  addSuivi,
  deleteSuivi,
  updateSuivi,
  getAllSuivis,
} = require("../controllers/suivisController");
const router = express.Router();
const multer = require("multer");
const verifyRole = require("../middlewares/verifyRole");

const memoryStokage = multer({ storage: multer.memoryStorage() });

router.post("/getByProduct", verifyJWT, getByProduct);
router.post("/", verifyJWT, memoryStokage.any(), addSuivi);
router.post("/delete", verifyJWT, deleteSuivi);
router.put("/", verifyJWT, memoryStokage.any(), updateSuivi);
router.get("/getAll", verifyJWT, verifyRole(process.env.PRIME), getAllSuivis);

module.exports = router;
