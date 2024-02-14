const express = require("express")
const verifyJWT = require("../middlewares/verifyJWT")
const { getLogs } = require("../controllers/logsController")
const router = express.Router()
const verifyRole = require("../middlewares/verifyRole")

router.get("/", verifyJWT, getLogs)
router.get("/read", verifyJWT, verifyRole(process.env.PRIME), getLogs)

module.exports = router