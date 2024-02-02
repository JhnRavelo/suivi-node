const express = require("express");
const router = express.Router();
const { login, logout, userRead, userLoginWeb } = require("../controllers/usersController");
const verifyJWT = require("../middlewares/verifyJWT");

router.route("/").post(login);

router.post("/logout", verifyJWT, logout);
router.get("/user", verifyJWT, userRead);
router.post("/login-web", userLoginWeb)

module.exports = router;
