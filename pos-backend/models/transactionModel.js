import mongoose from "mongoose";
import Order from "./orderModel.js";

const transactionSchema = new mongoose.Schema({
  orderRef: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  orderData: { type: Object, required: true },
  paidAt: { type: Date, required: true },
  paidAtFormatted: { type: String, required: true },
  orderDateFormatted: { type: String, required: true },
  billNumber: { type: String,unique: true, sparse: true, default: null },
}, { timestamps: true });



export default mongoose.model("Transaction", transactionSchema);
