const express = require("express");
const router = express.Router();
const {
  login,
  logout,
  userRead,
  userLoginWeb,
  userLogoutWeb,
  getAllUsers,
} = require("../controllers/usersController");
const verifyJWT = require("../middlewares/verifyJWT");
const verifyRole = require("../middlewares/verifyRole");

router.route("/").post(login);

router.post("/logout", verifyJWT, logout);
router.get("/user", verifyJWT, userRead);
router.post("/login-web", userLoginWeb);
router.get(
  "/logout-web",
  verifyJWT,
  verifyRole(process.env.PRIME),
  userLogoutWeb
);
router.get(
  "/getAll",
  verifyJWT,
  verifyRole(process.env.PRIME),
  getAllUsers
);

module.exports = router;
