const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const verifyRole = require("../middlewares/verifyRole");
const {
  exportDatabase,
  importDatabase,
  readExport,
  restoreExport,
  deleteExport,
} = require("../controllers/databaseController");
const router = express.Router();
const multer = require("multer");

const memoryStokage = multer({ storage: multer.memoryStorage() });

router.get("/export", verifyJWT, verifyRole(process.env.PRIME), exportDatabase);
router.get(
  "/read/export",
  verifyJWT,
  verifyRole(process.env.PRIME),
  readExport
);
router.post(
  "/import",
  verifyJWT,
  verifyRole(process.env.PRIME),
  memoryStokage.any(),
  importDatabase
);
router.post(
  "/restore/export",
  verifyJWT,
  verifyRole(process.env.PRIME),
  restoreExport
);
router.post(
  "/delete/export",
  verifyJWT,
  verifyRole(process.env.PRIME),
  deleteExport
);

module.exports = router;
