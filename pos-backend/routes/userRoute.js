import express from "express";
import { register, login, getUserData, logout } from "../controllers/userController.js";
import { isVerifiedUser } from "../middlewares/tokenVerification.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/", isVerifiedUser, getUserData);

export default router;
