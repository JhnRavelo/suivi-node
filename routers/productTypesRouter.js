const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const {
  getAllProductTypes,
  addProductType,
  deleteProductType,
  updateProductTypes,
} = require("../controllers/productTypeController");
const router = express.Router();
const multer = require("multer");
const verifyRole = require("../middlewares/verifyRole");

const memoryStokage = multer({ storage: multer.memoryStorage() });

router.get("/getAll", verifyJWT, getAllProductTypes);
router
  .route("/")
  .post(
    verifyJWT,
    verifyRole(process.env.PRIME),
    memoryStokage.any(),
    addProductType
  )
  .put(
    verifyJWT,
    verifyRole(process.env.PRIME),
    memoryStokage.any(),
    updateProductTypes
  );
router.delete(
  "/:id",
  verifyJWT,
  verifyRole(process.env.PRIME),
  deleteProductType
);

module.exports = router;
