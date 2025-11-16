import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import prisma from "../config/prismaConfig.js";

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET;

export const isVerifiedUser = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      return next(createHttpError(401, "Unauthorized - Token missing"));
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
    });

    if (!user) return next(createHttpError(401, "Invalid user token"));

    req.user = user;
    next();

  } catch (error) {
    console.error("🔴 JWT Verification Error:", error.message);
    return next(createHttpError(401, "Token expired or invalid"));
  }
};
