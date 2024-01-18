const express = require("express")
const verifyJWT = require("../middlewares/verifyJWT")
const { getByProduct, addSuivi, deleteSuivi } = require("../controllers/suivisController")
const router = express.Router()

router.post("/getByProduct", verifyJWT, getByProduct)
router.post("/addSuivi", verifyJWT, addSuivi)
router.post("/delete", verifyJWT, deleteSuivi)

module.exports = router
