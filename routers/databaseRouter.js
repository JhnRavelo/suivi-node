const express = require("express")
const verifyJWT = require("../middlewares/verifyJWT")
const verifyRole = require("../middlewares/verifyRole")
const { exportDatabase, importDatabase } = require("../controllers/databaseController")
const router = express.Router()
const multer = require("multer")

const memoryStokage = multer({ storage: multer.memoryStorage() });

router.get("/export", verifyJWT, verifyRole(process.env.PRIME), exportDatabase)
router.post("/import", verifyJWT, verifyRole(process.env.PRIME), memoryStokage.any(), importDatabase)

module.exports = router