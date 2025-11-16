import prisma from "../config/prismaConfig.js";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET;
console.log("JWT SECRET LOADED:", process.env.ACCESS_TOKEN_SECRET);


export const register = async (req, res, next) => {
  try {
    const { name, phone, email, password, role } = req.body;

    if (!name || !phone || !email || !password || !role)
      return next(createHttpError(400, "Missing fields"));

    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) return next(createHttpError(400, "User exists"));

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await prisma.users.create({
      data: { name, phone, email, password: hashed, role },
    });

    res.status(201).json({ success: true, data: newUser });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createHttpError(400, "All fields are required!"));
    }

    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user) {
      return next(createHttpError(401, "Invalid credentials!"));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(createHttpError(401, "Invalid credentials!"));
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });

    res.json({
      success: true,
      message: "User Login Successfully!",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    next(error);
  }
};

export const getUserData = async (req, res, next) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
    });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.clearCookie("access_token");
  res.json({ success: true, message: "Logged out" });
};
