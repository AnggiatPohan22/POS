const express = require("express");
const { register, login, getUserData, logout } = require("../controllers/userController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");
const router = express.Router();



//Aunthentication Routes
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(logout)


router.route("/").get(isVerifiedUser ,getUserData);

module.exports = router;