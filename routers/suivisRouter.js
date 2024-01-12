const express = require("express")
const verifyJWT = require("../middlewares/verifyJWT")
const { getByProduct } = require("../controllers/suivisController")
const router = express.Router()

router.post("/getByProduct", verifyJWT, getByProduct)

module.exports = router
