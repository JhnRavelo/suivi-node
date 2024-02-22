const express = require("express")
const verifyJWT = require("../middlewares/verifyJWT")
const verifyRole = require("../middlewares/verifyRole")
const { getAllProblems, addProblem } = require("../controllers/problemsController")
const router = express.Router()


router.get("/getAll", verifyJWT, verifyRole(process.env.PRIME), getAllProblems)
router.post("/", verifyJWT, verifyRole(process.env.PRIME), addProblem)

module.exports = router