import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import Table from "../models/tableModel.js";
import createHttpError from "http-errors";

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

        // CREATE ORDER
        const order = new Order({
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
            orderType: orderType || "Dine-In"
        });

        await order.save();

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

        const order = await Order.findById(id);

        if (!order) return next(createHttpError(404, "Order not found!"));

        res.status(200).json({ success: true, data: order });

    } catch (error) {
        next(error);
    }
};


const getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find();
        res.status(200).json({ data: orders });
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

        const order = await Order.findByIdAndUpdate(
            id,
            { orderStatus },
            { new: true }
        );

        if (!order) return next(createHttpError(404, "Order not found!"));

        // 🟩 Jika order selesai → bebaskan meja
        if (["completed", "cancelled", "PAID"].includes(orderStatus) && order.table) {
            await Table.findByIdAndUpdate(
                order.table,
                { 
                    status: "Available",
                    currentOrder: null 
                },
                { new: true }
            );

            console.log(`🟡 Table ${order.table} set back to AVAILABLE`);
        }

        res.status(200).json({ success: true, message: "Order Updated!", data: order });

    } catch (error) {
        next(error);
    }
};


// Export ES6
export { addOrder, getOrderById, getOrders, updateOrder };
