import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import createHttpError from "http-errors";

const addOrder = async (req, res, next) => {
    try {
        console.log("🔍 FULL REQUEST BODY:", req.body);
        console.log("🔍 Customer Name from frontend:", req.body.customerName);
        console.log("🔍 Customer Phone from frontend:", req.body.customerPhone);
        console.log("🔍 Guests from frontend:", req.body.guests);

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

        // ✅ VALIDATE - pastikan data customer ada
        if (!customerName || !customerPhone) {
            console.log("❌ Missing customer data!");
            const error = createHttpError(400, "Customer name and phone are required!");
            return next(error);
        }

        // ✅ CREATE ORDER dengan data dari frontend
        const order = new Order({
            customerDetails: {
                name: customerName,       // ← Pastikan ini dari input form
                phone: customerPhone,     // ← Pastikan ini dari input form
                guests: parseInt(guests)
            },
            bills: {
                total: total || 0,
                tax: tax || 0, 
                totalWithTax: totalWithTax || 0
            },
            items: items || [],
            table: table || null,
            orderType: orderType || "Dine-In"
        });

        await order.save();
        
        console.log("✅ Order saved with customer:", order.customerDetails.name);
        console.log("✅ Full order data:", order);
        
        res.status(201).json({ 
            success: true, 
            message: "Order created!", 
            data: order 
        });
    } catch (error) {
        console.error("❌ Order creation error:", error);
        next(error);
    }
}

const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            const error = createHttpError(404, "Invalid Id!");
            return next(error);
        }

        const order = await Order.findById(id);
        if (!order) {
            const error = createHttpError(404, "Order not found!");
            return next(error);
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
}

const getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find();
        res.status(200).json({ data: orders });
    } catch (error) {
        next(error);
    }
}

const updateOrder = async (req, res, next) => {
    try {
        const { orderStatus } = req.body;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            const error = createHttpError(404, "Invalid Id!");
            return next(error);
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { orderStatus },
            { new: true }
        );

        if (!order) {
            const error = createHttpError(404, "Order not found!");
            return next(error);
        }

        res.status(200).json({ success: true, message: "Order Updated!", data: order });
    } catch (error) {
        next(error);
    }
}

// Export ES6
export { addOrder, getOrderById, getOrders, updateOrder };