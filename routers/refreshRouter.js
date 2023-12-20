const express = require("express");
const router = express.Router();
const refresh = require("../controllers/refreshController");

router.route("/").post(refresh);

module.exports = router;
