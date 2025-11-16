import dotenv from "dotenv";
dotenv.config();

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

// ROUTES
import userRoute from "./routes/userRoute.js";
import tableRoute from "./routes/tableRoute.js";
import orderRoute from "./routes/orderRoute.js";
import xenditRoutes from "./routes/xenditRoute.js";
import outletRoute from "./routes/outletRoute.js";
import customerRoutes from "./routes/customerRoute.js";
import transactionRoutes from "./routes/transactionRoute.js";
import orderItemRoutes from "./routes/orderItemRoute.js";

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware for JSON requests (HARUS SEBELUM ROUTES)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: ["http://localhost:5173"]
}));

// RAW-body hanya untuk Webhook Xendit SAJA!
app.use("/webhook/xendit",
  bodyParser.raw({
    type: "*/*",
    verify: (req, res, buf) => (req.rawBody = buf),
  }),
);

// Root Test
app.get("/", (req, res) => {
  res.json({ message: "Hello from POS Server with Supabase + Prisma!" });
});

// API ROUTES
app.use("/api/user", userRoute);
app.use("/api/order", orderRoute);
app.use("/api/table", tableRoute);
app.use("/api/xendit", xenditRoutes);
app.use("/api/outlet", outletRoute);
app.use("/api/customers", customerRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/order-items", orderItemRoutes);

// Error Handler
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Start Server
app.listen(PORT, () =>
  console.log(`🔥 POS Backend running on: http://localhost:${PORT}`)
);
