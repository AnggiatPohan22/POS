//const path = require("path");
//const dotenv = require("dotenv");
require("dotenv").config();

//dotenv.config({ path: path.resolve(__dirname, "../.env") });

const config = Object.freeze({
    port: process.env.PORT || 3000,
    databaseURL: process.env.MONGODB_URL || "mongodb://localhost:27017/pos-db",
    nodeEnv : process.env.NODE_ENV || "development",
    ACCESS_TOKEN_SECRET : process.env.JWT_SECRET || "vNPORpVDTJqCXXUN7RipAVDYpeDrmWMEQMSMjM3KTZXwyGBMEP"
});

console.log("🧩 BY CONFIG Loaded JWT_SECRET:", process.env.JWT_SECRET);

module.exports = config;