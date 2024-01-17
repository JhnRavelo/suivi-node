const express = require("express")
const verifyJWT = require("../middlewares/verifyJWT")
const { getByProduct, addSuivi } = require("../controllers/suivisController")
const router = express.Router()

router.post("/getByProduct", verifyJWT, getByProduct)
router.post("/addSuivi", verifyJWT, addSuivi)

module.exports = router
