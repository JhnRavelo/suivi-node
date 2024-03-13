const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const { getLogs, readLogs } = require("../controllers/logsController");
const router = express.Router();
const verifyRole = require("../middlewares/verifyRole");

router.get("/", verifyJWT, getLogs);
router.get("/readLog", verifyJWT, verifyRole(process.env.PRIME), readLogs);

module.exports = router;
