import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import Table from "../models/tableModel.js";
import createHttpError from "http-errors";
import Outlet from "../models/outletModel.js";
import Transaction from "../models/transactionModel.js";
import { formatTime } from "../config/timeConfig.js";

const addOrder = async (req, res, next) => {
    try {
        console.log("🔍 FULL REQUEST BODY:", req.body);

        const { 
            customerName, 
            customerPhone, 
            guests, 
            items, 
            total, 
            tax, 
            totalWithTax,  
            table,
            orderType
        } = req.body;

        // VALIDATION
        if (!customerName || !customerPhone) {
            return next(createHttpError(400, "Customer name and phone are required!"));
        }

        if (!req.body.outlet) {
        return next(createHttpError(400, "Outlet required!"));
        }

        const outlet = await Outlet.findById(req.body.outlet);
        if (!outlet) return next(createHttpError(400, "Invalid outlet"));

        const typeCodeMap = {
        "Dine-In": "DI",
        "Take-Away": "TA",
        "Delivery": "DL",
        "Room": "RC"
        };

        const typeCode = typeCodeMap[orderType] || "XX";
        const outletCode = outlet.code;
        const yearMonth = new Date().toISOString().slice(2,7).replace("-", "");

        const filter = { orderType, outlet: outlet._id };
        const count = await Order.countDocuments(filter) + 1;

        const billNumber = `${outletCode}-${typeCode}-${yearMonth}-${String(count).padStart(4, "0")}`;

        // 
        const existingOrder = await Order.findOne({
        "customerDetails.phone": customerPhone,
        orderStatus: "PENDING"
        });

        if (existingOrder) {
        return next(createHttpError(400, "Order already exists for this customer!"));
        }

        // validasi berdasarkan table agar tidak duplicated
        if (table) {
        const active = await Order.findOne({ table, orderStatus: "PENDING" });
        if (active) {
            return next(createHttpError(400, "Table already has active order!"));
        }
        }

        
        const orderDate = new Date();
        const now = new Date();
        const orderDateFormatted = now.toLocaleString("id-ID", {
        timeZone: "Asia/Makassar",
        hour12: false,
        });


        // CREATE ORDER
        const order = new Order({
            billNumber,
            outlet: outlet._id, // ⬅ FIX: Wajib simpan outlet
            customerDetails: {
                name: customerName,
                phone: customerPhone,
                guests: parseInt(guests)
            },
            bills: {
                total: total || 0,
                tax: tax || 0,
                totalWithTax: totalWithTax || 0
            },
            items: items || [],
            table: table || null,
            orderType: orderType || "Dine-In",
            orderDate: now,
            orderDateFormatted
        });


        await order.save();
        await order.populate("outlet", "name code");
        await order.populate("table", "tableNo");


        // 🟩 UPDATE TABLE → Dine-in + set currentOrder
        if (table) {
            await Table.findByIdAndUpdate(
                table,
                { 
                    status: "Dine-in",
                    currentOrder: order._id
                },
                { new: true }
            );

            console.log(`🟢 Table ${table} marked as DINE-IN with order ${order._id}`);
        }

        res.status(201).json({
            success: true,
            message: "Order created!",
            data: order
        });
    } catch (error) {
        console.error("❌ Order creation error:", error);
        next(error);
    }
};


const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createHttpError(404, "Invalid Id!"));
        }

        const order = await Order.findById(id)
        .populate("table", "tableNo")
        .populate("outlet", "name code");


        if (!order) return next(createHttpError(404, "Order not found!"));

        res.status(200).json({ success: true, data: order });

    } catch (error) {
        next(error);
    }
};


const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("table", "tableNo")           // ambil tableNo
      .populate("outlet", "name code")       // 🔥 ambil outlet code & name
      .sort({ createdAt: -1 });              // newest first

    res.status(200).json({ success: true, data: orders});
  } catch (error) {
    next(error);
  }
};



const updateOrder = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(404, "Invalid Id!"));
    }

    const order = await Order.findById(id)
      .populate("table", "tableNo")
      .populate("outlet", "name code");

    if (!order) return next(createHttpError(404, "Order not found!"));

    // 🎯 Update Status
    order.orderStatus = orderStatus;

    // 🧠 Jika dibayar → generate billNumber bila masih null / undefined
    if (orderStatus === "PAID") {
      if (!order.billNumber) {
        const typeCodeMap = {
          "Dine-In": "DI",
          "Take-Away": "TA",
          "Delivery": "DL",
          "Room": "RC",
        };

        const typeCode = typeCodeMap[order.orderType] || "XX";
        const outletCode = order.outlet.code;
        const yearMonth = new Date().toISOString().slice(2, 7).replace("-", "");
        const count = await Order.countDocuments({
          orderType: order.orderType,
          outlet: order.outlet._id,
        }) + 1;

        order.billNumber = `${outletCode}-${typeCode}-${yearMonth}-${String(count).padStart(4, "0")}`;
      }

      // ⏱ Insert waktu PAID dengan timezone WITA
      const paidAt = new Date();
      const paidAtFormatted = new Date(paidAt).toLocaleString("id-ID", {
        timeZone: "Asia/Makassar",
        hour12: false,
      });

      // 🆕 Fallback orderDateFormatted jika missing
      const orderDateFormatted = order.orderDateFormatted || 
        new Date(order.orderDate).toLocaleString("id-ID", {
          timeZone: "Asia/Makassar",
          hour12: false,
        });

      const transaction = new Transaction({
        orderRef: order._id,
        orderData: order.toObject(), // Backup full order data!
        billNumber: order.billNumber, // ⬅ PENAMBAHAN WAJIB
        orderDateFormatted: order.orderDateFormatted || new Date(order.orderDate).toLocaleString("id-ID", {
          timeZone: "Asia/Makassar",
          hour12: false,
        }),
        paidAt,
        paidAtFormatted
      });

      await transaction.save();

      // 🟢 Update Table kembali Available
      if (order.table) {
        await Table.findByIdAndUpdate(order.table, {
          status: "Available",
          currentOrder: null,
        });
      }

      // Hapus order setelah menjadi Transaction
      await Order.findByIdAndDelete(order._id);

      return res.status(200).json({
        success: true,
        message: "Order paid & moved to transactions",
      });
    }

    // Kalau cuma update selain PAID
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order updated successfully!",
    });
  } catch (error) {
    console.error("❌ Update Order Error FIXED:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};




// Export ES6
export { addOrder, getOrderById, getOrders, updateOrder };
