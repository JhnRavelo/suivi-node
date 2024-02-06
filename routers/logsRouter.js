const express = require("express")
const verifyJWT = require("../middlewares/verifyJWT")
const { getLogs } = require("../controllers/logsController")
const router = express.Router()

router.get("/", verifyJWT, getLogs)

module.exports = router