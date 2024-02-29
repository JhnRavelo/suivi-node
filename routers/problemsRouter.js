const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const verifyRole = require("../middlewares/verifyRole");
const {
  getAllProblems,
  addProblem,
  updateProblem,
  deleteProblems,
} = require("../controllers/problemsController");
const router = express.Router();

router.get("/getAll", verifyJWT, verifyRole(process.env.PRIME), getAllProblems);
router
  .route("/")
  .post(verifyJWT, verifyRole(process.env.PRIME), addProblem)
  .put(verifyJWT, verifyRole(process.env.PRIME), updateProblem);
router.delete("/:id", verifyJWT, verifyRole(process.env.PRIME), deleteProblems)

module.exports = router;
