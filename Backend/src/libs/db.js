import e from "express";
import mongoose from "mongoose";
export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Kết nối đến MongoDB thành công!");
    } catch (error) {
        console.error("Lỗi kết nối đến MongoDB:", error);
        process.exit(1); // Thoát ứng dụng nếu không thể kết nối đến MongoDB
    }
}