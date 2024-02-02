const express = require("express");
const router = express.Router();
const {
  refresh,
  handleRefreshToken,
} = require("../controllers/refreshController");

router.route("/").post(refresh).get(handleRefreshToken);

module.exports = router;
