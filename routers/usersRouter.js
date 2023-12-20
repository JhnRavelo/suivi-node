const express = require("express");
const router = express.Router();
const { login, logout, userRead } = require("../controllers/usersController");
const verifyJWT = require("../middlewares/verifyJWT");

router.route("/").post(login);

router.post("/logout", verifyJWT, logout);
router.get("/user", verifyJWT, userRead);

module.exports = router;
