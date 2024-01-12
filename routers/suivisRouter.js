const express = require("express")
const verifyJWT = require("../middlewares/verifyJWT")
const router = express.Router()

router.get("/", verifyJWT,)

module.exports = router
