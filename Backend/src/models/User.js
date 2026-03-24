import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    username: {
        type: String,   
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },

    hashedPassword: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },

    displayName: {
        type: String,
        required: true,
        trim: true
    },

    avatarUrl: {
        type: String,
        default: ""
    },// hien thi anh dai dien cua nguoi dung

    avatarID: {
        type: String,
    },// public_id cloudinary de xoa anh khi nguoi dung doi avatar

    bio: {
        type: String,
        maxlength: 500 // gioi han do dai cua mo ta ve nguoi dung
    },// mo ta ve nguoi dung
 
    phone:{
        type: String,
        sparse: true, // cho phép giá trị trống hoặc không tồn tại
        unique: true, // đảm bảo số điện thoại là duy nhất nếu tồn tại
    }


}
, { timestamps: true } // tự động thêm createdAt và updatedAt);
);

const User = mongoose.model("User", userSchema);
export default User;
