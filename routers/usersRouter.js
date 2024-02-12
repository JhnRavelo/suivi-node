const express = require("express");
const router = express.Router();
const {
  login,
  logout,
  userRead,
  userLoginWeb,
  userLogoutWeb,
  getAllUsers,
  addUser,
} = require("../controllers/usersController");
const verifyJWT = require("../middlewares/verifyJWT");
const verifyRole = require("../middlewares/verifyRole");


router.post("/", login);
router.post("/logout", verifyJWT, logout);
router.post("/login-web", userLoginWeb);

router.post(
  "/add",
  verifyJWT,
  verifyRole(process.env.PRIME),
  addUser
);
router.get("/user", verifyJWT, userRead);
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
