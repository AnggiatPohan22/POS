import mongoose from "mongoose";

const VASchema = new mongoose.Schema({
    external_id: String,
    bank_code: String,
    account_number: String,
    expected_amount: Number,
    status: String,
    createdAt: Date,
    updatedAt: Date,
}, { timestamps: true });

export default mongoose.model("VA", VASchema);
