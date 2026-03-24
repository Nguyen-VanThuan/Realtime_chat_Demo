import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    chatRoomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChatRoom",
        required: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    messageType: {
        type: String,
        enum: ["text", "image", "file"],
        default: "text"
    },
    fileUrl: {
        type: String
    },
    fileName: {
        type: String
    }
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;