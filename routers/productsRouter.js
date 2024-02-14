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

router.post("/", verifyJWT, addProduct);
router.get("/getAll", verifyJWT, verifyRole(process.env.PRIME), getAllProducts);
router.delete("/:id", verifyJWT, verifyRole(process.env.PRIME), deleteProduct);
router.put("/", verifyJWT, verifyRole(process.env.PRIME), updateProduct);

module.exports = router;
