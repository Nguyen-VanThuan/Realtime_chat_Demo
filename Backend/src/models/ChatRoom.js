import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    type: {
        type: String,
        enum: ["private", "group"],
        default: "private"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
export default ChatRoom;