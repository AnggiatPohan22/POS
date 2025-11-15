import express, { application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import connectDB from "./config/database.js";
import config from "./config/config.js";
import dotenv from "dotenv";

// ROUTES - IMPORT DENGAN .js EXTENSION
import userRoute from "./routes/userRoute.js";
import tableRoute from "./routes/tableRoute.js";
import orderRoute from "./routes/orderRoute.js";
import xenditRoutes from "./routes/xenditRoutes.js";
import outletRoute from "./routes/outletRoute.js";

// MODELS
import Outlet from "./models/outletModel.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Connect DB
connectDB();

// RAW BODY middleware (harus sebelum json())
app.use(bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

// Normal Middleware
app.use(cors({
    credentials: true,
    origin: ["http://localhost:5173"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Root Test
app.get("/", (req, res) => {
    res.json({ message: "Hello from POS Server!" });
});

// API ROUTES
app.use("/api/user", userRoute);
app.use("/api/order", orderRoute);
app.use("/api/table", tableRoute);
app.use("/api/xendit", xenditRoutes);
app.use("/api/outlet", outletRoute);

// WEBHOOK Routes
app.use("/webhook/xendit", xenditRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
    console.error("Error:", error);
    res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal Server Error"
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});

// === ✅ SEED OUTLETS DATA JIKA BELUM ADA ===
const seedOutlets = async () => {
  const outlets = [
    { name: "Aruma Restaurant", code: "AR" },
    { name: "Aruma Bar", code: "AB" }
  ];

  for (let outlet of outlets) {
    const exists = await Outlet.findOne({ code: outlet.code });
    if (!exists) {
      await Outlet.create(outlet);
      console.log(`🟢 Outlet created: ${outlet.name}`);
    }
  }
};

seedOutlets();