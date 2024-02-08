const express = require("express")
const verifyJWT = require("../middlewares/verifyJWT")
const { getAllProductTypes, addProductType } = require("../controllers/productTypeController")
const router = express.Router()
const multer = require("multer")

const memoryStokage = multer({storage:multer.memoryStorage()})

router.get("/getAll", verifyJWT,getAllProductTypes)
router.post("/add", verifyJWT, memoryStokage.any(), addProductType)

module.exports = router