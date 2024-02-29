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
  updateUser,
  deleteUser,
} = require("../controllers/usersController");
const verifyJWT = require("../middlewares/verifyJWT");
const verifyRole = require("../middlewares/verifyRole");

router.post("/", login);
router.post("/logout", verifyJWT, logout);
router.post("/login-web", userLoginWeb);

router
  .route("/user")
  .post(verifyJWT, verifyRole(process.env.PRIME), addUser)
  .put(verifyJWT, verifyRole(process.env.PRIME), updateUser)
  .get(verifyJWT, userRead);

router.get(
  "/logout-web",
  verifyJWT,
  verifyRole(process.env.PRIME),
  userLogoutWeb
);

router.delete(
  "/user/:id",
  verifyJWT,
  verifyRole(process.env.PRIME),
  deleteUser
);
router.get("/getAll", verifyJWT, verifyRole(process.env.PRIME), getAllUsers);

module.exports = router;
