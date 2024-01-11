const express = require("express")
const verifyJWT = require("../middlewares/verifyJWT")
const { addProduct } = require("../controllers/productsController")
const router = express.Router()

router.post("/", verifyJWT, addProduct)

module.exports = router