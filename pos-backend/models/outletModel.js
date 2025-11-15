import mongoose from "mongoose";

const outletSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export default mongoose.model("Outlet", outletSchema);
