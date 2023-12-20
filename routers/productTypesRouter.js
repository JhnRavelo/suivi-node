const express = require("express")
const verifyJWT = require("../middlewares/verifyJWT")
const { getAllProductTypes } = require("../controllers/productTypeController")
const router = express.Router()

router.get("/getAll", verifyJWT, getAllProductTypes)

module.exports = router