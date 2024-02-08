const express = require("express")
const verifyJWT = require("../middlewares/verifyJWT")
const { getAllProductTypes, addProductType, deleteProductType } = require("../controllers/productTypeController")
const router = express.Router()
const multer = require("multer")

const memoryStokage = multer({storage:multer.memoryStorage()})

router.get("/getAll", verifyJWT,getAllProductTypes)
router.post("/add", verifyJWT, memoryStokage.any(), addProductType)
router.delete("/:id", verifyJWT, deleteProductType)

module.exports = router