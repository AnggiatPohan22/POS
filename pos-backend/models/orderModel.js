import mongoose from "mongoose";

// Define Order Schema
const orderSchema = new mongoose.Schema({
  customerDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    guests: { type: Number, required: true },
  },
  orderStatus: {
    type: String,
    default: "PENDING", // PENDING | PAID
  },
  orderType: {
    type: String,
    enum: ["Dine-In", "Take-Away", "Delivery", "Room"],
    default: "Dine-In",
  },
  billNumber: {
  type: String,
  unique: true,
  required: true,
  sparse: true
  },
  outlet: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Outlet",
  required: false
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  // 🆕 Waktu create order format Indonesia (String)
  orderDateFormatted: {
    type: String,
    default: null,
  },
  bills: {
    total: { type: Number, required: true },
    tax: { type: Number, required: true },
    totalWithTax: { type: Number, required: true },
  },
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  table: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },

  /** PAYMENT DETAILS **/
  payment: {
    vaExternalId: { type: String, default: null },
    vaAccountNumber: { type: String, default: null },
    bankCode: { type: String, default: "BCA" },
    status: { type: String, default: "PENDING" }, // PENDING | PAID
    paidAmount: { type: Number, default: 0 },
    expirationDate: { type: Date, default: null },
  },
}, { timestamps: true });

orderSchema.index({ billNumber: 1 }, { unique: true });

export default mongoose.model("Order", orderSchema);

