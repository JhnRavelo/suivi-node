const express = require("express")
const verifyJWT = require("../middlewares/verifyJWT")
const verifyRole = require("../middlewares/verifyRole")
const { exportDatabase } = require("../controllers/databaseController")
const router = express.Router()

router.get("/export", verifyJWT, verifyRole(process.env.PRIME), exportDatabase)

module.exports = router