const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const {
  addProduct,
  getAllProducts,
} = require("../controllers/productsController");
const verifyRole = require("../middlewares/verifyRole");
const router = express.Router();

router.post("/", verifyJWT, addProduct);
router.get("/getAll", verifyJWT, verifyRole(process.env.PRIME), getAllProducts);

module.exports = router;
