const createHttpError = require("http-errors");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config")

const register = async (req, res, next) => {
    try{
        if (!req.body || Object.keys(req.body).length === 0) {
        const error = createHttpError(400, "Request body is empty!");
        return next(error);
        }

        //console.log("Body diterima:", req.body);
        const { name, phone, email, password, role} = req.body;

        if(!name || !phone || !email || !password || !role){
            const error = createHttpError(400, "All fields are required!");
            return next(error);
        }

        const isUserPresent = await User.findOne({email});
        if (isUserPresent){
            const error = createHttpError(400, "User already exist!");
            return next(error);
        }

        const user = {name, phone, email, password, role};
        const newUser = User(user);
        await newUser.save();

        res.status(201).json({success: true, message: "New user created!", data: newUser});

    } catch (error){
        next(error);
    }
}

const login = async (req, res, next) => {

    try{

        console.log("🔑 BY UC JWT Secret in Controller:", config.ACCESS_TOKEN_SECRET);
        const { email, password } = req.body;
        
        if(!email || !password){
            const error = createHttpError(400, "All fields are required!")
            return next(error);
        }

        const isUserPresent = await User.findOne({email});
        if (!isUserPresent){
            const error = createHttpError(401, "Invalid Credentials!");
            return next(error);
        }

        const isMatch = await bcrypt.compare(password, isUserPresent.password);
        if(!isMatch){
            const error = createHttpError(401, "Invalid Credentials!");
            return next(error);
        }

        const accessToken = jwt.sign({_id: isUserPresent._id}, config.ACCESS_TOKEN_SECRET, {
            expiresIn : '1d'
        });

        res.cookie('access_token', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            sameSite: 'lax',
            secure: false 
        })

        res.status(200).json({success: true, message: "User Login Successfully!", 
            data: isUserPresent
        });
        

    } catch (error){
        return next(error);
    }
}
// untuk getData cookies
const getUserData = async(req, res, next) => {
    console.log("🟢 getUserData dijalankan, user:", req.user);
    try{
        const user = await User.findById(req.user._id);
        res.status(200).json({success: true, data: user});

    }catch(error){
        console.error("🔥 Error getUserData:", error);
        return next(error);
    }
}

const logout = async (req, res, next) => {
  try {
    // hapus cookie token
    res.clearCookie("access_token", {
      httpOnly: true,
      sameSite: "lax", // jika deploy ke https, ubah ke 'none'
      secure: false, // jika deploy di https, ubah ke true
      path: "/", // pastikan sesuai dengan path waktu set cookie
    });

    return res
      .status(200)
      .json({ success: true, message: "User Logout Successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      message: "Logout failed",
      error: error.message,
    });
  }
};


module.exports = {register, login, getUserData, logout}