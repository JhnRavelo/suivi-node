const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const {
  addProduct,
  getAllProducts,
  deleteProduct,
  updateProduct,
} = require("../controllers/productsController");
const verifyRole = require("../middlewares/verifyRole");
const router = express.Router();

router
  .route("/")
  .post(verifyJWT, addProduct)
  .put(verifyJWT, verifyRole(process.env.PRIME), updateProduct);
router.get("/getAll", verifyJWT, verifyRole(process.env.PRIME), getAllProducts);
router.delete("/:id", verifyJWT, verifyRole(process.env.PRIME), deleteProduct);

module.exports = router;
