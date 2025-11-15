const jwt = require("jsonwebtoken");
const createHttpError = require("http-errors");
const config = require("../config/config");

const isVerifiedUser = (req, res, next) => {
  try {
    console.log("🟢 tokenVerification.js CHECK TOKEN");

    const token = req.cookies.access_token; // 👈 FIX: Ambil token yang benar

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Token missing",
      });
    }

    const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET);
    req.user = decoded; // ✔ Bisa dipakai di route lain

    next();
  } catch (error) {
    console.log("🔴 TOKEN ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: "Token expired or invalid. Please login again.",
    });
  }
};

module.exports = { isVerifiedUser };
